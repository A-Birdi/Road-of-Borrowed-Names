// HX66 (docs/expressive/CONTRACT.md): the player's appearance on the approved painted Harmony art (contract v3,
// docs/harmony/contract/CONTRACT.md), from fixtures GENERATED from docs/harmony/contract/registry.json — never a
// hand-kept list:
// 1. coverage: every hairstyle, garment shape, creation accessory and keepsake visible in the bust (worn through the
//    registry's resolver, which must give exactly what the game's RB.equip.lookWith gives: same-place replacement and
//    the keepsake's own colours) at least once; every skin, hair colour and cloth palette used (pale to dark); at most
//    the creation limit of accessories per look, the keepsake on top; the keepsake not shown in the bust adds nothing;
// 2. stress pairs chosen by measuring the art: glasses under the fringe-heaviest hairstyles, headwear (hat, cap,
//    headband; a head wrap under a cap) over the largest hair, scarf and cape with the satchel strap, and per companion
//    the state whose brush arm comes nearest (or across) the player's face;
// 3. every fixture × every companion at peak (stress fixtures and two coverage fixtures: every state, and the compact
//    pair at peak): both busts painted, no whole-bust fallback recorded, every worn accessory's files in the plan and
//    its pixels in the bust, each keepsake colour override applied, the contract's canvas sizes, faces inside the
//    canvas, nothing thrown; layer order: nothing over the hand, the strap under the scarf and the cape, the fringe over
//    glasses, no hair above a hat's band;
// 4. the live game, in session-only debug campaigns in a fresh Playwright context (its own IndexedDB): equip a keepsake
//    → the worn look and the next technique's cut-in use it; unequip → gone; save, reload, load → the same look and the
//    same pixels; two slots with different looks → each its own composition, nothing cached from the other.
// Every look here is a SYNTHETIC fixture assembled for inspection, not real play.
// Usage: node tests/e2e/harmony_appearance.mjs [--sheets]
//   --sheets also writes the contact sheets to docs/screenshots/harmony/appearance/ (the normal run writes nothing).
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const SHEETS = process.argv.includes('--sheets');
const t0 = Date.now();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = (v) => JSON.stringify(v);
const secs = () => ((Date.now() - t0) / 1000).toFixed(0) + ' s';

// ---- the registry -----------------------------------------------------------------------------------------------------
const REG = JSON.parse(fs.readFileSync(path.join(root, 'docs/harmony/contract/registry.json'), 'utf8'));
const HAIR = REG.hairstyles.ids;
const SHAPES = REG.garmentShapes.all;
const CUTS = REG.garmentShapes.creationCuts.map((c) => c.id);
const CA = REG.creationAccessories;
const CREATION = CA.ids.filter((a) => CA.entries[a] && CA.entries[a].visibleInBust);
const MAX_ACC = CA.maxChosen;
const KS = REG.keepsakes;
const KEEP = Object.keys(KS).filter((k) => KS[k].visibleInBust).sort();
const UNSEEN = Object.keys(KS).filter((k) => !KS[k].visibleInBust).sort();
const PAL = REG.palettes;
const nSkin = PAL.skin.length, nHairCol = PAL.hair.length, nCloth = PAL.cloth.length;
const STATES = REG.contract.states;
const PAIR = REG.contract.pair;
const COMPS = Object.keys(REG.companions).sort();
const SLEEVE_SHAPE = {};
for (const s of SHAPES) { const v = REG.garmentShapes.sleeveOf[s]; if (!SLEEVE_SHAPE[v]) SLEEVE_SHAPE[v] = s; }
const range = (n) => Array.from({ length: n }, (_, i) => i);

// The registry's resolver (registry.resolver.lookWith, src/engine/07_equip.js): copy the base look, take off what sits
// in the keepsake's place (samePlace, else the same accessory), put the keepsake's accessory on last, then its colours.
function lookWith(base, id) {
  const out = Object.assign({}, base, { acc: (base.acc || []).slice() });
  const k = id && KS[id];
  if (!k || !k.acc) return out;
  const drop = REG.resolver.samePlace[k.acc] || [k.acc];
  out.acc = out.acc.filter((a) => drop.indexOf(a) < 0);
  out.acc.push(k.acc);
  if (k.wear) Object.assign(out, k.wear);
  return out;
}
// the files each worn accessory must bring into the player's plan (the keepsake's own: its variant, e.g. a knitted scarf)
function expectFiles(look, keepsake) {
  const out = {};
  for (const a of look.acc) {
    if (keepsake && KS[keepsake].acc === a) out[a] = (KS[keepsake].files || []).map((f) => f.file);
    else if (CA.entries[a]) out[a] = CA.entries[a].files.map((f) => f.file);
    else out[a] = Object.values(KS).filter((k) => k.acc === a).map((k) => (k.files || []).map((f) => f.file))[0] || [];
  }
  return out;
}
// does wearing the keepsake's colours change anything (a colour equal to its channel's default does not)
function wearChanges(id) {
  const k = KS[id];
  if (!k.wear) return null;
  return Object.entries(k.wear).some(([f, v]) => !(k.channel && k.channel.field === f && String(k.channel.def).toLowerCase() === String(v).toLowerCase()));
}
const fixtures = [];
function add(fx) {
  fx.look = fx.keepsake ? lookWith(fx.base, fx.keepsake) : Object.assign({}, fx.base, { acc: fx.base.acc.slice() });
  // (what of the creation look the keepsake took the place of: its same-place accessories, re-added as the keepsake's own)
  fx.replaced = fx.keepsake ? fx.base.acc.filter((a) => (KS[fx.keepsake].replaces || [KS[fx.keepsake].acc]).indexOf(a) >= 0) : [];
  fx.expect = expectFiles(fx.look, fx.keepsake);
  fx.wearChanges = fx.keepsake ? wearChanges(fx.keepsake) : null;
  fixtures.push(fx);
  return fx;
}
// 1. coverage: one fixture per keepsake visible in the bust (the cosmetic slot holds one); hairstyle, shape, skin, hair
//    colour and cloth palette advance by strides coprime with their counts, so every value comes round; two creation
//    accessories each, in turn; once each has been worn, a keepsake that takes the place of a creation accessory is
//    worn over it (a second scarf, a hat under a cap) so the same-place rule is exercised too.
KEEP.forEach((id, i) => {
  const k = KS[id], repl = (k.replaces || []).filter((a) => CREATION.indexOf(a) >= 0);
  let pair = [CREATION[(2 * i) % CREATION.length], CREATION[(2 * i + 1) % CREATION.length]];
  if (2 * i >= CREATION.length && repl.length) pair = [repl[0], pair.find((a) => repl.indexOf(a) < 0) || CREATION.find((a) => repl.indexOf(a) < 0)];
  add({ id: 'k' + String(i + 1).padStart(2, '0') + '_' + id, group: 'coverage', keepsake: id,
    base: { skin: (i * 3) % nSkin, hair: HAIR[i % HAIR.length], hairColor: (i * 7) % nHairCol, outfit: (i * 5) % nCloth, shape: SHAPES[i % SHAPES.length], acc: pair.slice(0, MAX_ACC) } });
});
// a creation look with nothing in the cosmetic slot
add({ id: 'c01_creation_only', group: 'coverage', base: { skin: nSkin - 1, hair: HAIR[KEEP.length % HAIR.length], hairColor: 0, outfit: 1, shape: CUTS[1 % CUTS.length], acc: CREATION.slice(-MAX_ACC) } });
// anything the strides left out gets a creation look of its own (none expected with today's registry)
const WANT = { hair: HAIR, shape: SHAPES, acc: CREATION, skin: range(nSkin), hairColor: range(nHairCol), outfit: range(nCloth) };
const seenOf = () => {
  const s = { hair: new Set(), shape: new Set(), acc: new Set(), skin: new Set(), hairColor: new Set(), outfit: new Set(), keepsake: new Set() };
  for (const f of fixtures) { const L = f.look; s.hair.add(L.hair); s.shape.add(L.shape); s.skin.add(L.skin); s.hairColor.add(L.hairColor); s.outfit.add(L.outfit); for (const a of L.acc) s.acc.add(a); if (f.keepsake) s.keepsake.add(f.keepsake); }
  return s;
};
for (let n = 0; n < 24; n++) {
  const s = seenOf(), miss = {};
  for (const k in WANT) miss[k] = WANT[k].filter((v) => !s[k].has(v));
  if (!Object.values(miss).some((m) => m.length)) break;
  const pick = (k, i) => (miss[k].length ? miss[k][0] : WANT[k][i % WANT[k].length]);
  add({ id: 'c' + String(n + 2).padStart(2, '0') + '_fill', group: 'coverage', base: { skin: pick('skin', n), hair: pick('hair', n), hairColor: pick('hairColor', n), outfit: pick('outfit', n), shape: pick('shape', n), acc: miss.acc.slice(0, MAX_ACC).concat(CREATION).filter((a, i, A) => A.indexOf(a) === i).slice(0, MAX_ACC) } });
}
// a keepsake the bust does not show (registry: visibleInBust false, with its reason): worn, it must add no file
UNSEEN.forEach((id, i) => add({ id: 'u' + String(i + 1).padStart(2, '0') + '_' + id, group: 'unseen', keepsake: id,
  base: { skin: (i + 2) % nSkin, hair: HAIR[(i + 3) % HAIR.length], hairColor: (i + 5) % nHairCol, outfit: (i + 6) % nCloth, shape: CUTS[i % CUTS.length], acc: CREATION.slice(0, MAX_ACC) } }));

// ---- the browser --------------------------------------------------------------------------------------------------------
const { srv, url } = await serve();
const browser = await launch();
const VIEW = { width: 1920, height: 1080 };

// in-page helpers (the art module's own plan and paint, read the way 88_harmony_raster.js paint() draws them)
async function helpers(p) {
  await p.evaluate(() => {
    const HA = RB.harmonyArt, HR = RB.harmonyRaster, H = RB.harmonyContract;
    const man = () => HR.manifest();
    const fnv = (d) => { let h = 2166136261; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) >>> 0; return h; };
    const hashCv = (cv) => fnv(cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data);
    const W = H.BUST.w, BH = H.BUST.h;
    // where a kit part is drawn in the bust: its group's offset, plus the hairstyle's attachment offset when hair-mounted
    function offOf(pl, q) {
      const g = pl.groups[H.GROUP_OF[q.slot]] || [0, 0];
      let dx = g[0], dy = g[1];
      const P = man().pc || {}, at = q.acc && H.ACC[q.acc] && H.ACC[q.acc].hair && P.attach && P.attach[pl.style] && P.attach[pl.style][q.acc];
      if (at) { dx += at[0]; dy += at[1]; }
      return [dx, dy];
    }
    function maskOf(pl, q) {
      const f = HR._.decoded.get(q.file), m = new Uint8Array(W * BH);
      if (!f) return null;
      const [dx, dy] = offOf(pl, q);
      for (let y = 0; y < f.h; y++) {
        const Y = y + dy;
        if (Y < 0 || Y >= BH) continue;
        for (let x = 0; x < f.w; x++) { if (!(f.px[y * f.w + x] >>> 24)) continue; const X = x + dx; if (X >= 0 && X < W) m[Y * W + X] = 1; }
      }
      return m;
    }
    // the parts in drawing order (the pose's arm slot, glasses over a listed fringe, the order inside a slot)
    function ordered(pl) {
      const P = man().pc || {};
      let order = H.PC_SLOTS.slice();
      const armAt = P.armSlot && P.armSlot[pl.pose];
      if (armAt && H.ARM_SLOT[armAt]) { order = order.filter((s) => s !== 'arm'); order.splice(order.indexOf(H.ARM_SLOT[armAt]), 0, 'arm'); }
      if ((P.glassesOver || []).indexOf(pl.style) >= 0) { order = order.filter((s) => s !== 'glasses'); order.splice(order.indexOf('hair_front') + 1, 0, 'glasses'); }
      const rank = (q) => { const L = H.SLOT_ORDER[q.slot]; return L ? L.indexOf(q.acc) : 0; };
      const out = [];
      for (const s of order) out.push(...pl.parts.filter((q) => q.slot === s).sort((a, b) => rank(a) - rank(b)));
      return out;
    }
    // a part's pixels that nothing drawn after it covers
    function exclusive(pl, pick) {
      const parts = ordered(pl), i = parts.findIndex(pick);
      if (i < 0) return null;
      const m = maskOf(pl, parts[i]);
      for (const q of parts.slice(i + 1)) { const o = maskOf(pl, q); for (let k = 0; k < m.length; k++) if (o[k]) m[k] = 0; }
      return { m, file: parts[i].file, n: m.reduce((a, b) => a + b, 0) };
    }
    // the player's painted bust alone (192 × 160 px), or null when its files are not all decoded
    function bust(look, st, comp) { const pl = HR.plan('pc', look, st, comp); return { pl, px: HR.ready(pl) ? HR.paint(pl, look, true).px : null }; }
    // the same, decoding first what a variant of the look needs (a look without an item may need another file)
    async function bustL(look, st, comp) { const pl = HR.plan('pc', look, st, comp); if (pl.ok && !HR.ready(pl)) await HR.load(pl.files); return bust(look, st, comp); }
    const diff = (a, b, m) => { let n = 0; for (let i = 0; i < a.length; i++) if ((!m || m[i]) && a[i] !== b[i]) n++; return n; };
    const without = (look, acc) => Object.assign({}, look, { acc: look.acc.filter((a) => acc.indexOf(a) < 0) });
    // no hair above the band of a hat or cap, in the columns it covers: every opaque pixel there belongs to another part
    function hatCheck(pl, px) {
      const P = man().pc || {};
      const hats = pl.parts.filter((q) => q.acc && H.ACC[q.acc].hides && P.hatBand && P.hatBand[q.acc] != null);
      if (!hats.length) return null;
      const top = new Int16Array(W).fill(-1);
      for (const q of hats) {
        const f = HR._.decoded.get(q.file), at = (P.attach && P.attach[pl.style] && P.attach[pl.style][q.acc]) || [0, 0];
        const ox = at[0] + pl.groups.head[0], oy = at[1] + pl.groups.head[1];
        for (let x = 0; x < f.w; x++) for (let y = 0; y < f.h; y++) if (f.px[y * f.w + x] >>> 24) { const X = x + ox, Y = Math.max(0, y + oy); if (X >= 0 && X < W && (top[X] < 0 || Y < top[X])) top[X] = Y; break; }
      }
      const other = new Uint8Array(W * BH);
      for (const q of pl.parts) if (q.slot !== 'hair_back' && q.slot !== 'hair_front') { const m = maskOf(pl, q); for (let k = 0; k < m.length; k++) if (m[k]) other[k] = 1; }
      let bad = 0, hidden = 0;
      for (let x = 0; x < W; x++) for (let y = 0; y < top[x]; y++) { const i = y * W + x; if ((px[i] >>> 24) && !other[i]) bad++; }
      for (const q of pl.parts) if (q.slot === 'hair_back' || q.slot === 'hair_front') { const m = maskOf(pl, q); for (let i = 0; i < m.length; i++) if (m[i] && top[i % W] >= 0 && ((i / W) | 0) < top[i % W]) hidden++; }
      return { hats: hats.map((q) => q.acc), bad, hidden };
    }
    window.HX = { fnv, hashCv, offOf, maskOf, ordered, exclusive, bust, bustL, diff, without, hatCheck };

    // one fixture: prepare and compose with each companion at the states asked; every check the fixture calls for
    window.HX.run = async (fx, o) => {
      const look = fx.look, out = { id: fx.id, bad: [], comps: 0, hashes: {}, acc: {}, wear: null, hat: [], order: [], fallbacks: 0, errors: [] };
      const f0 = HR.stats().fallbacks;
      for (const comp of o.comps) {
        const states = (o.states && o.states[comp]) || ['peak'];
        const specs = states.map((ph) => ({ comp, look, phase: ph, variant: 'standard' })).concat(o.compact ? [{ comp, look, phase: 'peak', variant: 'compact' }] : []);
        try { await HA.prepare(specs, { async: true }); } catch (e) { out.errors.push('prepare ' + comp + ': ' + e.message); continue; }
        for (const sp of specs) {
          const tag = comp + ' ' + sp.phase + (sp.variant === 'compact' ? ' compact' : '');
          let c;
          try { c = HA.compose(sp); } catch (e) { out.errors.push(tag + ': ' + e.message); continue; }
          out.comps++;
          const P = H.PAIR[sp.variant];
          if (!c.painted || c.painted[comp] !== 'painted' || c.painted.pc !== 'painted') out.bad.push(tag + ': ' + JSON.stringify(c.painted));
          if (c.w !== P.w || c.h !== P.h || c.cv.width !== P.w || c.cv.height !== P.h) out.bad.push(tag + ': size ' + c.w + ' × ' + c.h + ' (canvas ' + c.cv.width + ' × ' + c.cv.height + ')');
          for (const f of c.faces) if (f.x < 0 || f.y < 0 || f.x + f.w > c.w || f.y + f.h > c.h) out.bad.push(tag + ': ' + f.who + "'s face outside the canvas");
          const pl = HR.plan('pc', look, sp.phase, comp);
          if (!pl.ok || pl.missing.length) out.bad.push(tag + ': plan not ok ' + JSON.stringify(pl.missing));
          for (const a in fx.expect) {
            const got = pl.parts.filter((q) => q.acc === a).map((q) => q.file).sort(), want = fx.expect[a].slice().sort();
            if (JSON.stringify(got) !== JSON.stringify(want)) out.bad.push(tag + ': ' + a + ' brings ' + JSON.stringify(got) + ', the registry says ' + JSON.stringify(want));
          }
          out.hashes[comp + '|' + sp.phase + '|' + sp.variant] = hashCv(c.cv);
          // no hair above a hat's band, at every state composed
          if (sp.variant === 'standard') { const b = bust(look, sp.phase, comp); if (b.px) { const h = hatCheck(b.pl, b.px); if (h) out.hat.push(Object.assign({ at: tag }, h)); } }
        }
        // each worn accessory: its pixels in the bust at peak (with and without it)
        const b = bust(look, 'peak', comp);
        if (!b.px) { out.bad.push(comp + ' peak: the bust is not paintable'); continue; }
        for (const a of look.acc) {
          const w = await bustL(without(look, [a]), 'peak', comp);
          (out.acc[a] = out.acc[a] || {})[comp] = w.px ? diff(b.px, w.px) : -1;
        }
        // the keepsake's colours: the same look without them
        if (fx.keepsake && fx.wear && out.wear == null) {
          const plain = Object.assign({}, look); for (const k in fx.wear) delete plain[k];
          const w = await bustL(plain, 'peak', comp);
          out.wear = w.px ? diff(b.px, w.px) : -1;
        }
        // layer order: within the pixels of `over` that nothing later covers, the bust is the same without `under`
        for (const L of fx.layers || []) for (const st of states) {
          const B = await bustL(look, st, comp), Wo = await bustL(without(look, L.under), st, comp);
          if (!B.px || !Wo.px) { out.bad.push(comp + ' ' + st + ': layer check not paintable'); continue; }
          const ex = exclusive(B.pl, (q) => (L.over === 'arm' ? q.slot === 'arm' : L.over === 'hair_front' ? q.slot === 'hair_front' : q.file === L.over));
          if (!ex) { out.bad.push(comp + ' ' + st + ': no part ' + L.over); continue; }
          const row = { comp, st, what: L.over, over: ex.file, under: L.under, px: ex.n, changed: diff(B.px, Wo.px, ex.m), seen: diff(B.px, Wo.px) };
          if (L.over === 'arm') {
            const f = B.pl.face, m = maskOf(B.pl, B.pl.parts.find((q) => q.slot === 'arm'));
            let n = 0; for (let y = f[1]; y < f[3]; y++) for (let x = f[0]; x < f[2]; x++) if (m[y * W + x]) n++;
            row.armOnFace = n;
          }
          out.order.push(row);
        }
      }
      out.fallbacks = HR.stats().fallbacks - f0;
      out.fallbackLog = HR.stats().fallbackLog.slice(-Math.min(out.fallbacks, 4));
      return out;
    };
  });
}

// ============================================================================================================================
// Part A — the art, fixture by fixture
// ============================================================================================================================
{
  const { p, errors, requests, ctx } = await page(browser, url, { viewport: VIEW });
  await p.waitForFunction(() => RB.harmonyRaster.active(), null, { timeout: 15000 });
  await helpers(p);

  // ---- the registry against the game it was exported from -----------------------------------------------------------------
  const game = await p.evaluate(({ bases }) => {
    const SP = RB.sprites, items = RB.content.items, HA = RB.harmonyArt, HR = RB.harmonyRaster;
    const cos = Object.keys(items).filter((k) => items[k] && items[k].slot === 'cosmetic').sort();
    return {
      hair: SP.HAIRSTYLES, acc: SP.ACCESSORIES, cos, comps: HA.COMPANIONS.slice().sort(), states: HA.PHASES, native: HA.NATIVE,
      approval: HR.manifest().pc.approval, art: HR.stats().set, synthetic: HR.stats().synthetic,
      looks: bases.map(([base, id]) => RB.equip.lookWith(base, id)),
    };
  }, { bases: fixtures.filter((f) => f.keepsake).map((f) => [f.base, f.keepsake]) });
  ok(J(game.hair) === J(HAIR) && J(game.acc) === J(CA.ids) && J(game.cos) === J(Object.keys(KS).sort()) && J(game.comps) === J(COMPS),
    'the registry matches the game: ' + HAIR.length + ' hairstyles, ' + CA.ids.length + ' creation accessories, ' + Object.keys(KS).length + ' cosmetic keepsakes, companions ' + COMPS.join(', '));
  ok(J(game.states) === J(STATES) && game.native.standard.w === PAIR.standard.w && game.native.standard.h === PAIR.standard.h && game.native.compact.w === PAIR.compact.w && game.native.compact.h === PAIR.compact.h && game.approval === 'approved' && game.synthetic === false,
    'the shipped painted art is installed: ' + STATES.length + ' states, the ' + PAIR.standard.w + ' × ' + PAIR.standard.h + ' pair (compact ' + PAIR.compact.w + ' × ' + PAIR.compact.h + '), player kit ' + game.approval);
  const kf = fixtures.filter((f) => f.keepsake), lookBad = kf.filter((f, i) => J(game.looks[i]) !== J(f.look)).map((f) => f.id);
  ok(!lookBad.length, 'the registry\'s resolver gives exactly what RB.equip.lookWith gives, for all ' + kf.length + ' keepsake fixtures (same-place replacement, the keepsake\'s colours)' + (lookBad.length ? ': differ ' + lookBad.join(', ') : ''));

  // ---- coverage of the generated set ---------------------------------------------------------------------------------
  {
    const s = seenOf();
    const cov = { hairstyles: [HAIR, s.hair], shapes: [SHAPES, s.shape], 'creation accessories': [CREATION, s.acc], keepsakes: [KEEP, s.keepsake], skins: [range(nSkin), s.skin], 'hair colours': [range(nHairCol), s.hairColor], 'cloth palettes': [range(nCloth), s.outfit] };
    const miss = Object.entries(cov).map(([k, [want, got]]) => [k, want.filter((v) => !got.has(v))]).filter(([, m]) => m.length);
    const tooMany = fixtures.filter((f) => f.base.acc.length > MAX_ACC).map((f) => f.id);
    const replaced = fixtures.filter((f) => f.replaced.length).map((f) => f.keepsake + ' over ' + f.replaced.join('+'));
    ok(!miss.length && !tooMany.length, fixtures.length + ' fixtures generated from the registry cover ' + Object.entries(cov).map(([k, [w]]) => w.length + ' ' + k).join(', ') + '; each creation look within ' + MAX_ACC + ' accessories' + (miss.length ? ' — MISSING ' + J(miss) : '') + (tooMany.length ? ' — over the limit: ' + tooMany.join(', ') : ''));
    ok(replaced.length >= 2 && fixtures.some((f) => f.keepsake && !f.replaced.length && f.look.acc.length > MAX_ACC), 'the cosmetic slot is exercised both ways: on top of two creation accessories, and taking the place of one (' + replaced.join('; ') + ')');
  }

  // ---- measuring the art: the fringe over the glasses, the size of each hairstyle, the arm against the face ----------------
  const art = await p.evaluate(async ({ HAIR, COMPS, STATES, SLEEVE_SHAPE }) => {
    const HR = RB.harmonyRaster, man = HR.manifest(), dec = HR._.decoded;
    const out = { hair: {}, arm: {} };
    for (const s of HAIR) {
      const names = ['pc_hair_' + s + '_front'].concat(man.files['pc_hair_' + s + '_back'] ? ['pc_hair_' + s + '_back'] : []);
      await HR.load(names.concat(['acc_glasses']));
      const fr = dec.get(names[0]), bk = names[1] ? dec.get(names[1]) : null, gl = dec.get('acc_glasses');
      // fringe: front hair over the glasses; area: all of the hair; crown: the hair above the line a hat's band covers
      const band = Math.min(...Object.values(man.pc.hatBand || { hat: 40 })), W = fr.w;
      let over = 0, area = 0, crown = 0;
      for (let i = 0; i < fr.px.length; i++) { const a = fr.px[i] >>> 24, b = bk ? bk.px[i] >>> 24 : 0; if (a && (gl.px[i] >>> 24)) over++; if (a || b) { area++; if (((i / W) | 0) < band) crown++; } }
      out.hair[s] = { fringe: over, area, crown };
    }
    for (const comp of COMPS) {
      out.arm[comp] = [];
      for (const sleeve of Object.keys(SLEEVE_SHAPE)) for (const st of STATES) {
        const pl = HR.plan('pc', { hair: 'short', shape: SLEEVE_SHAPE[sleeve], acc: [] }, st, comp), q = pl.parts.find((x) => x.slot === 'arm');
        await HR.load([q.file]);
        const f = dec.get(q.file), [dx, dy] = pl.groups.torso, [x0, y0, x1, y1] = pl.face;
        let inside = 0, d = Infinity;
        for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
          if (!(f.px[y * f.w + x] >>> 24)) continue;
          const X = x + dx, Y = y + dy;
          if (X >= x0 && X < x1 && Y >= y0 && Y < y1) inside++;
          d = Math.min(d, Math.hypot(Math.max(x0 - X, 0, X - (x1 - 1)), Math.max(y0 - Y, 0, Y - (y1 - 1))));
        }
        out.arm[comp].push({ sleeve, st, file: q.file, inside, d: +d.toFixed(1) });
      }
    }
    return out;
  }, { HAIR, COMPS, STATES, SLEEVE_SHAPE });
  const FRONT_ONLY = REG.hairstyles.frontOnly || [];
  const fringe = HAIR.filter((s) => FRONT_ONLY.indexOf(s) < 0).sort((a, b) => art.hair[b].fringe - art.hair[a].fringe).slice(0, 3);
  // large hair: the three largest overall and the three with the most volume above a hat's band (together)
  const hairy = HAIR.filter((s) => s !== 'wrap' && FRONT_ONLY.indexOf(s) < 0);
  const byArea = hairy.slice().sort((a, b) => art.hair[b].area - art.hair[a].area), byCrown = hairy.slice().sort((a, b) => art.hair[b].crown - art.hair[a].crown);
  const large = [...new Set(byArea.slice(0, 3).concat(byCrown.slice(0, 3)))];
  const beats = {};
  for (const c of COMPS) beats[c] = art.arm[c].slice().sort((a, b) => b.inside - a.inside || a.d - b.d || STATES.indexOf(b.st) - STATES.indexOf(a.st))[0];
  console.log('     art: fringe over the glasses ' + J(Object.fromEntries(HAIR.map((s) => [s, art.hair[s].fringe]))) + '; hair area ' + J(Object.fromEntries(HAIR.map((s) => [s, art.hair[s].area]))) + '; above the hat band ' + J(Object.fromEntries(HAIR.map((s) => [s, art.hair[s].crown]))));
  console.log('     art: the arm nearest the face per companion ' + J(beats));
  ok(fringe.length === 3 && large.length >= 3 && COMPS.every((c) => beats[c]), 'measured from the art: the fringe-heaviest hairstyles over the glasses ' + fringe.join(', ') + '; the largest hair ' + byArea.slice(0, 3).join(', ') + ', the most above a hat\'s band ' + byCrown.slice(0, 3).join(', ') + '; the hand-to-face beat per companion ' + COMPS.map((c) => c + ' ' + beats[c].st + ' (' + beats[c].sleeve + ', ' + beats[c].inside + ' arm px on the face)').join(', '));

  // ---- the heaviest look's whole performance fits the decoded-file cache ------------------------------------------------------
  // (the cut-in prepares every state of a pairing at once: were its files more than the cache holds, the first states would be
  // evicted before they are drawn and shown in code). The heaviest look, from the registry: the hairstyle with the most
  // files, the creation accessories with the most files, and the keepsake with the most files that goes on top of them.
  {
    const accN = (a) => (CA.entries[a] ? CA.entries[a].files.length : 0);
    const accs = CREATION.slice().sort((a, b) => accN(b) - accN(a)).slice(0, MAX_ACC);
    const onTop = KEEP.filter((k) => !(KS[k].replaces || []).some((a) => accs.indexOf(a) >= 0)).sort((a, b) => (KS[b].files || []).length - (KS[a].files || []).length)[0];
    const fit = await p.evaluate((HAIR) => {
      const HR = RB.harmonyRaster, names = Object.keys(HR.manifest().files), nOf = (h) => names.filter((n) => n.indexOf('pc_hair_' + h + '_') === 0).length;
      return { hair: HAIR.slice().sort((a, b) => nOf(b) - nOf(a))[0], cap: HR.stats().cap };
    }, HAIR);
    // (the look is built in node with the registry's resolver, then handed to the page)
    const heavy = lookWith({ skin: 0, hair: fit.hair, hairColor: 0, outfit: 0, shape: 'robe', acc: accs }, onTop);
    const per = await p.evaluate(({ heavy, STATES, COMPS }) => COMPS.map((comp) => { const f = new Set(); for (const st of STATES) { for (const n of RB.harmonyRaster.plan('pc', heavy, st, comp).files) f.add(n); for (const n of RB.harmonyRaster.plan(comp, null, st, comp).files) f.add(n); } return [comp, f.size]; }), { heavy, STATES, COMPS });
    ok(per.every(([, n]) => n <= fit.cap), 'the heaviest look (' + heavy.hair + ', ' + heavy.acc.join('+') + ', keepsake ' + onTop + ') needs at most ' + Math.max(...per.map(([, n]) => n)) + ' files for a whole performance with any companion (' + per.map(([c, n]) => c + ' ' + n).join(', ') + '), within the decoded-file cache of ' + fit.cap);
  }

  // ---- 2. the stress pairs, from the measurements ------------------------------------------------------------------------
  const keepOf = (acc) => KEEP.find((k) => KS[k].acc === acc);
  const capK = keepOf('cap'), hatK = keepOf('hat'), knitK = KEEP.find((k) => KS[k].acc === 'scarf' && KS[k].files.some((f) => f.file !== CA.entries.scarf.files[0].file)), dyedK = KEEP.find((k) => KS[k].acc === 'scarf' && k !== knitK);
  let si = 0;
  const vary = () => { const i = si++; return { skin: (i * 2 + 1) % nSkin, hairColor: (i * 3 + 2) % nHairCol, outfit: (i * 3 + 1) % nCloth }; };
  const stress = [];
  const S = (id, kind, o) => { const f = add(Object.assign({ id, group: 'stress', kind }, o)); stress.push(f); return f; };
  // glasses under the fringe-heaviest hair: the fringe is drawn over the glasses, the glasses still show
  fringe.forEach((h, i) => S('s_glasses_' + h, 'glasses + fringe', { base: Object.assign(vary(), { hair: h, shape: SHAPES[i % SHAPES.length], acc: ['glasses', ['earrings', 'scarf', 'satchel'][i % 3]] }), layers: [{ over: 'hair_front', under: ['glasses'] }] }));
  // headwear over the largest hair (a hat chosen at creation, a cap and a straw hat worn as keepsakes, a headband)
  const HW = [{ acc: ['hat', 'earrings'] }, { acc: ['hat', 'scarf'], keepsake: capK }, { acc: ['headband', 'satchel'] }, { acc: ['flower', 'satchel'], keepsake: hatK }, { acc: ['hat', 'cape'] }];
  large.forEach((h, i) => { const w = HW[i % HW.length]; S('s_' + (w.keepsake ? KS[w.keepsake].acc : w.acc[0]) + '_' + h, 'headwear + large hair', { base: Object.assign(vary(), { hair: h, shape: SHAPES[(i + 2) % SHAPES.length], acc: w.acc }), keepsake: w.keepsake }); });
  S('s_cap_wrap', 'headwear + large hair', { base: Object.assign(vary(), { hair: 'wrap', shape: 'robe', acc: ['hat', 'earrings'] }), keepsake: capK });
  // the satchel's strap under a scarf (chosen, knitted, dyed) and under a cape
  S('s_scarf_strap', 'scarf + strap', { base: Object.assign(vary(), { hair: 'ponytail', shape: 'tunic', acc: ['scarf', 'satchel'] }), layers: [{ over: 'acc_scarf', under: ['satchel'] }] });
  S('s_knit_strap', 'scarf + strap', { base: Object.assign(vary(), { hair: 'braid', shape: 'coat', acc: ['scarf', 'satchel'] }), keepsake: knitK, layers: [{ over: 'acc_scarf_knit', under: ['satchel'] }] });
  S('s_dyed_strap', 'scarf + strap', { base: Object.assign(vary(), { hair: 'long', shape: 'robe', acc: ['satchel', 'glasses'] }), keepsake: dyedK, layers: [{ over: 'acc_scarf', under: ['satchel'] }] });
  S('s_cape_strap', 'scarf + strap', { base: Object.assign(vary(), { hair: 'bob', shape: 'apron', acc: ['cape', 'satchel'] }), layers: [{ over: 'acc_cape_front', under: ['satchel'] }] });
  // the hand across the face: per companion its beat, on a look with glasses, the heaviest fringe and a head or ear piece
  const nearFace = KEEP.filter((k) => !KS[k].hidesHairAboveIt && (KS[k].hairMounted || (KS[k].files || []).some((f) => /ear/.test(f.slot))));
  COMPS.forEach((c, i) => { const bt = beats[c]; S('s_hand_' + c, 'hand across face', { comp: c, beat: bt.st, base: Object.assign(vary(), { hair: fringe[i % fringe.length], shape: SLEEVE_SHAPE[bt.sleeve], acc: ['glasses', i % 2 ? 'scarf' : 'flower'] }), keepsake: nearFace[i % nearFace.length], layers: [{ over: 'arm', under: ['__all__'] }] }); });
  for (const f of stress) for (const L of f.layers || []) if (L.under[0] === '__all__') L.under = f.look.acc.slice();
  for (const f of fixtures) if (f.keepsake && KS[f.keepsake].wear) f.wear = KS[f.keepsake].wear;
  ok(stress.length >= 4 + COMPS.length && stress.every((f) => f.base.acc.length <= MAX_ACC), stress.length + ' stress fixtures: ' + [...new Set(stress.map((f) => f.kind))].map((k) => k + ' ×' + stress.filter((f) => f.kind === k).length).join(', '));

  // ---- 3. every fixture × every companion -------------------------------------------------------------------------------
  const ALL = Object.fromEntries(COMPS.map((c) => [c, STATES]));
  const results = [];
  const allStates = new Set(fixtures.filter((f) => f.group === 'coverage').slice(0, 2).map((f) => f.id).concat(stress.map((f) => f.id)));
  const fallbacks0 = await p.evaluate(() => RB.harmonyRaster.stats().fallbacks);
  for (const fx of fixtures) {
    const every = allStates.has(fx.id);
    const r = await p.evaluate(({ fx, o }) => window.HX.run(fx, o), { fx, o: { comps: COMPS, states: every ? ALL : null, compact: every } });
    r.fx = fx; results.push(r);
    const accBad = Object.entries(r.acc).filter(([a, by]) => !(fx.expect[a] && fx.expect[a].length ? Object.values(by).some((n) => n > 0) : Object.values(by).every((n) => n === 0)));
    const wearBad = fx.wear && !(fx.wearChanges ? r.wear > 0 : r.wear === 0);
    const hatBad = r.hat.filter((h) => h.bad);
    const orderBad = r.order.filter((o) => o.changed || (o.over !== 'arm' && !o.seen));
    const tag = fx.id + ' (' + fx.look.hair + ', ' + fx.look.shape + ', ' + fx.look.acc.join('+') + ')';
    const good = !r.bad.length && !r.errors.length && !r.fallbacks && !accBad.length && !wearBad && !hatBad.length && !orderBad.length;
    const notes = [];
    if (r.hat.length) notes.push('hat band: ' + r.hat.reduce((n, h) => n + h.hidden, 0) + ' hair px hidden over ' + r.hat.length + ' states');
    if (r.order.length) { const o0 = r.order[0], what = o0.what === 'arm' ? 'the brush arm' : o0.what === 'hair_front' ? 'the fringe' : o0.what; notes.push(what + ' over ' + o0.under.join('+') + ' at ' + r.order.length + ' states: unchanged in ' + r.order.reduce((n, o) => n + o.px, 0) + ' px' + (o0.armOnFace != null ? ', ' + Math.max(...r.order.filter((o) => o.comp === fx.comp && o.st === fx.beat).map((o) => o.armOnFace)) + ' arm px on the face at ' + fx.comp + ' ' + fx.beat : '')); }
    if (fx.wear) notes.push('colours ' + (fx.wearChanges ? r.wear + ' px changed' : 'equal to the channel default'));
    ok(good, tag + ': ' + r.comps + ' compositions painted at ' + PAIR.standard.w + ' × ' + PAIR.standard.h + (every ? ' (every state, and compact at peak)' : ' (peak)') + '; accessories in the plan and the bust ' + J(Object.fromEntries(Object.entries(r.acc).map(([a, by]) => [a, Math.max(...Object.values(by))]))) + (notes.length ? '; ' + notes.join('; ') : '') +
      (good ? '' : ' — ' + J({ bad: r.bad.slice(0, 4), errors: r.errors.slice(0, 3), fallbacks: r.fallbacks, log: r.fallbackLog, acc: accBad, wear: wearBad ? r.wear : undefined, hat: hatBad.slice(0, 2), order: orderBad.slice(0, 3) })));
  }
  const fallbacks1 = await p.evaluate(() => RB.harmonyRaster.stats());
  ok(fallbacks1.fallbacks === fallbacks0 && !fallbacks1.decodeErrors.length, 'no whole-bust fallback recorded over the whole set (' + fallbacks0 + ' → ' + fallbacks1.fallbacks + '), no decode errors; ' + results.reduce((n, r) => n + r.comps, 0) + ' compositions');
  // every look is its own drawing: the peak pair with each companion differs between every two fixtures
  {
    const dup = [];
    for (const c of COMPS) { const seen = new Map(); for (const r of results) { const h = r.hashes[c + '|peak|standard']; if (seen.has(h)) dup.push(c + ': ' + seen.get(h) + ' = ' + r.id); else seen.set(h, r.id); } }
    ok(!dup.length, 'every fixture composes to its own pixels with every companion (' + results.length + ' looks × ' + COMPS.length + ' companions)' + (dup.length ? ': ' + dup.slice(0, 4).join('; ') : ''));
  }
  // the hand across the face, per companion: the arm reaches the face at its beat and nothing is drawn over it
  {
    const rows = stress.filter((f) => f.kind === 'hand across face').map((f) => { const r = results.find((x) => x.id === f.id), o = r.order.find((x) => x.comp === f.comp && x.st === f.beat); return { comp: f.comp, beat: f.beat, armOnFace: o && o.armOnFace, changed: r.order.reduce((n, x) => n + x.changed, 0), checked: r.order.length }; });
    ok(rows.length === COMPS.length && rows.every((r) => r.changed === 0 && r.checked === COMPS.length * STATES.length), 'the hand across the face, one beat per companion: no accessory, fringe or glasses drawn over the brush hand at any state (' + rows.map((r) => r.comp + ' ' + r.beat + ': ' + r.armOnFace + ' arm px on the face').join('; ') + ')');
  }

  // ---- --sheets: the contact sheets ----------------------------------------------------------------------------------------
  if (SHEETS) {
    const SH = path.join(root, 'docs/screenshots/harmony/appearance');
    fs.mkdirSync(SH, { recursive: true });
    const hairName = (i) => PAL.hair[i] ? PAL.hair[i].name : String(i);
    const label = (f) => {
      const L = f.look;
      return [f.id + (f.kind ? ' — ' + f.kind : ''), L.hair + ' (' + hairName(L.hairColor) + ') · skin ' + L.skin + ' · ' + L.shape + (CUTS.indexOf(L.shape) < 0 ? ' (kit only)' : '') + ' · cloth ' + L.outfit,
        (L.acc.join(' + ') || 'no accessories') + (f.keepsake ? ' · keepsake ' + f.keepsake + (f.replaced.length ? ' (in place of ' + f.replaced.join(', ') + ')' : '') : '')];
    };
    const sheet = async (title, cells, cols) => {
      for (const sc of [2, 1]) {
        const res = await p.evaluate(async ({ title, cells, cols, sc }) => {
          const HA = RB.harmonyArt, W = 352 * sc, Hh = 160 * sc, cw = W + 24, ch = Hh + 70, top = 70;
          const cv = document.createElement('canvas'); cv.width = 24 + cols * cw; cv.height = top + Math.ceil(cells.length / cols) * ch + 30;
          const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#22252e'; g.fillRect(0, 0, cv.width, cv.height);
          const txt = (s, x, y, size, col, bold) => { g.font = (bold ? 'bold ' : '') + size + 'px sans-serif'; g.fillStyle = col; g.fillText(s, x, y); };
          txt(title[0], 14, 28, 20, '#ff9a6a', true); txt(title[1], 14, 52, 13, '#a8a294');
          const notPainted = [];
          // (one cell at a time: prepared, then drawn — the decoded files are a bounded cache, as in the game)
          for (let i = 0; i < cells.length; i++) {
            const c = cells[i], x = 24 + (i % cols) * cw, y = top + Math.floor(i / cols) * ch;
            await HA.prepare({ comp: c.comp, look: c.look, phase: c.phase }, { async: true });
            const a = HA.compose({ comp: c.comp, look: c.look, phase: c.phase });
            if (a.painted.pc !== 'painted' || a.painted[c.comp] !== 'painted') notPainted.push(c.label[0] + ' ' + JSON.stringify(a.painted));
            g.drawImage(a.cv, x, y, a.w * sc, a.h * sc);
            c.label.forEach((s, k) => txt(s + (k === 0 ? '   [' + c.comp + ', ' + c.phase + ']' : ''), x, y + Hh + 16 + k * 16, 13, k ? '#e8e2d0' : '#f0c878', !k));
          }
          txt('Synthetic fixtures for inspection, not real play. tests/e2e/harmony_appearance.mjs --sheets', 14, cv.height - 10, 12, '#a8a294');
          return { data: cv.toDataURL('image/png'), notPainted };
        }, { title, cells, cols, sc });
        const buf = Buffer.from(res.data.split(',')[1], 'base64');
        if (buf.length < 1.4 * 1048576 || sc === 1) return { buf, sc, notPainted: res.notPainted, cells: cells.length };
      }
    };
    const cov = fixtures.filter((f) => f.group !== 'stress');
    const s1 = await sheet(['HX66 — the appearance fixtures on the approved painted art (contract v3): each look\'s peak pair with one companion', 'Generated from docs/harmony/contract/registry.json: every hairstyle, garment shape, creation accessory and keepsake shown in the bust; skins, hair colours and cloth palettes pale to dark.'],
      cov.map((f, i) => ({ comp: COMPS[i % COMPS.length], phase: 'peak', look: f.look, label: label(f) })), 3);
    const s2 = await sheet(['HX66 — stress pairs on the approved painted art (contract v3)', 'Glasses under the fringe-heaviest hair; headwear over the largest hair; the strap under a scarf or cape; per companion the beat where the brush hand comes to the face.'],
      stress.map((f, i) => ({ comp: f.comp || COMPS[i % COMPS.length], phase: f.beat || 'peak', look: f.look, label: label(f) })), 3);
    const wrote = [];
    for (const [name, s] of [['fixtures_peak.png', s1], ['stress.png', s2]]) { fs.writeFileSync(path.join(SH, name), s.buf); wrote.push(name + ' ' + (s.buf.length / 1024).toFixed(0) + ' KiB at ' + s.sc + '×'); }
    ok(s1.buf.length < 1.5 * 1048576 && s2.buf.length < 1.5 * 1048576 && !s1.notPainted.length && !s2.notPainted.length, 'contact sheets written to docs/screenshots/harmony/appearance/: ' + wrote.join(', ') + '; every one of their ' + (s1.cells + s2.cells) + ' pairs painted' + (s1.notPainted.length + s2.notPainted.length ? ' — NOT: ' + s1.notPainted.concat(s2.notPainted).slice(0, 4).join('; ') : ''));
  }

  ok(!errors.length && !requests.length, 'part A: no page errors, no network requests (' + errors.concat(requests).slice(0, 4).join('; ') + ')');
  await ctx.close();
  console.log('     (part A done at ' + secs() + ')');
}

// ============================================================================================================================
// Part B — the live game: equip, unequip, save and load, two slots (session-only debug campaigns, this context's storage)
// ============================================================================================================================
{
  const { p, errors, requests, ctx } = await page(browser, url, { viewport: VIEW });
  const COMP = 'suzu';
  // two creation looks and two keepsakes, from the registry: a hat with its own colour (hides the hair above its band) and
  // a scarf that brings its own file
  const K1 = KEEP.find((k) => KS[k].hidesHairAboveIt && wearChanges(k)), K2 = KEEP.find((k) => KS[k].acc === 'scarf' && KS[k].files.some((f) => f.file !== CA.entries.scarf.files[0].file));
  const L1 = { skin: 1, hair: 'curly', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'satchel'] };
  const L2 = { skin: 5, hair: 'bob', hairColor: 8, outfit: 6, shape: 'robe', acc: ['earrings', 'scarf'] };
  const W1 = lookWith(L1, K1), W2 = lookWith(L2, K2);
  const boot = () => p.evaluate(() => { window.__RB_DEV_HARMONY__ = true; });
  await boot();
  await helpers(p);
  const mode = await p.evaluate(() => RB.save.status().mode);
  ok(mode === 'idb', 'storage: this test context\'s own IndexedDB (' + mode + ')');

  // a session-only debug campaign at the mill (where the development viewer stages its encounter), with a look
  const campaign = (look, give) => p.evaluate(({ look, give, COMP }) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: COMP, flags: { rw_gears: true } });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; s.words = ['mamoru', 'mizu', 'iyasu'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    s.player.look = JSON.parse(JSON.stringify(look));
    for (const id of give) RB.state.give(s, id, 1);
    return RB.equip.look(s);
  }, { look, give, COMP });
  const worn = () => p.evaluate(() => ({ look: RB.equip.look(RB.game.s), world: RB.world.W.player && RB.world.W.player.look, cosmetic: RB.game.s.equip.cosmetic, key: RB.harmonyKit.lookKey(RB.equip.look(RB.game.s)) }));
  // the next technique: an encounter staged as RB.harmonyCutin.dev.battle() stages one (Harmony filled by the fixture),
  // on the campaign that is open; the presentation played by RB.harmonyCutin.dev.play(); the cut-in's canvas read on
  // every frame its state changes
  async function technique() {
    await p.evaluate((COMP) => {
      Object.assign(RB.game.settings, { textSpeed: 'instant', input: 'choice', battleAnim: 'normal', reducedMotion: false, harmonyFlourish: true });
      RB.game.applySettings();
      const L = RB.combatLogic, init = L.init;
      L.init = function (...a) { L.init = init; const r = init.apply(this, a); r.harmony = r.harmonyMax; return r; };
      const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
      RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'dev:harmony' });
    }, COMP);
    for (let i = 0; i < 600; i++) {
      const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
      if (s.cards) break;
      if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
      await p.waitForTimeout(25);
    }
    // (the encounter's own preparation decodes the pairing's files in idle slices: let it finish, as play would)
    await p.waitForFunction(() => RB.harmonyRaster.stats().pending === 0, null, { timeout: 15000 });
    await p.waitForTimeout(300);
    return p.evaluate(async () => {
      const rec = [], s0 = RB.harmonyCutin.stats().started;
      let done = false;
      const tick = () => {
        const st = RB.harmonyCutin.state(), el = document.querySelector('.cb-cutin');
        if (el && st.phase && (!rec.length || rec[rec.length - 1].phase !== st.phase)) rec.push({ phase: st.phase, variant: st.variant, w: el.width, h: el.height, hash: window.HX.hashCv(el) });
        if (!done) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      const r = await Promise.race([RB.harmonyCutin.dev.play({}), new Promise((res) => setTimeout(() => res({ kind: 'timeout' }), 20000))]);
      done = true;
      const last = RB.harmonyCutin.last();
      return { kind: r ? r.kind : 'refused', started: RB.harmonyCutin.stats().started - s0, rec, peak: (rec.find((x) => x.phase === 'peak') || {}).hash, last: last && { look: last.look, variant: last.variant, fit: last.fit, displayed: last.displayed } };
    });
  }
  // what the cut-in should have drawn for a look, at peak and at every state it showed (its variant; the bare compact pair
  // has no backing or effects): the painted compositions
  const expected = (look, t) => p.evaluate(async ({ look, comp, variant, bare, phases }) => {
    const HA = RB.harmonyArt, by = {};
    let painted = true;
    for (const ph of [...new Set(['peak'].concat(phases))]) {
      await HA.prepare({ comp, look, phase: ph, variant }, { async: true });
      const c = HA.compose({ comp, look, phase: ph, variant, backing: !bare, fx: !bare });
      by[ph] = window.HX.hashCv(c.cv);
      painted = painted && c.painted[comp] === 'painted' && c.painted.pc === 'painted';
    }
    return { hash: by.peak, by, painted: painted ? { [comp]: 'painted', pc: 'painted' } : null, files: RB.harmonyRaster.plan('pc', look, 'peak', comp).files };
  }, { look, comp: COMP, variant: (t.last && t.last.variant) || 'standard', bare: !!(t.last && t.last.fit === 'compact-bare'), phases: t.rec.map((r) => r.phase) });
  const isPainted = (e) => e.painted && e.painted[COMP] === 'painted' && e.painted.pc === 'painted';
  // every state the live cut-in drew is the painted composition of that state
  const allStates = (t, e) => t.rec.length >= STATES.length && t.rec.every((r) => r.hash === e.by[r.phase]);
  const kFiles = (id) => (KS[id].files || []).map((f) => f.file);
  // the game's own composition for the worn look (no look given: RB.equip.look of the running game), standard, peak
  const gameComp = () => p.evaluate(async (comp) => {
    const HA = RB.harmonyArt;
    await HA.prepare({ comp, phase: 'peak' }, { async: true });
    const c = HA.compose({ comp, phase: 'peak' }), st = HA.stats();
    return { hash: window.HX.hashCv(c.cv), painted: c.painted, key: c.key, busts: st.keys.busts, comps: st.keys.compositions };
  }, COMP);
  const leaveTo = (slot) => p.evaluate(async (slot) => RB.game.loadCampaign(slot), slot);

  // ---- equip → the worn look and the next technique's cut-in ----------------------------------------------------------------
  const base1 = await campaign(L1, [K1, K2]);
  ok(J(base1) === J(L1), 'a debug campaign with creation look 1 (' + L1.hair + ', ' + L1.shape + ', ' + L1.acc.join('+') + '), nothing worn in the cosmetic slot');
  const eq = await p.evaluate((id) => RB.equip.equip(RB.game.s, id), K1);
  const w1 = await worn();
  ok(eq && w1.cosmetic === K1 && J(w1.look) === J(W1) && J(w1.world) === J(W1), 'equip ' + K1 + ': RB.equip.look and the world sprite wear it, as the registry\'s resolver says (' + w1.look.acc.join('+') + ', ' + J(KS[K1].wear) + ')');
  const saved1 = await p.evaluate(async () => { const r = await RB.save.manualSave(1); return { rev: r.rev, look: r.state.player.look, equip: r.state.equip }; });
  ok(saved1.equip.cosmetic === K1 && J(saved1.look) === J(L1), 'saved to slot 1 with ' + K1 + ' worn (manual save, revision ' + saved1.rev + ')');
  const t1 = await technique();
  const e1 = await expected(W1, t1), e1bare = await expected(L1, t1);
  ok(t1.kind === 'dev' && t1.started === 1 && t1.last && t1.last.displayed && J(t1.last.look) === J(W1) && t1.rec.length >= 5, 'the next technique\'s cut-in takes the worn look (' + t1.last.variant + ', ' + t1.last.fit + '; ' + t1.rec.map((r) => r.phase).join(' → ') + ')');
  ok(t1.peak != null && t1.peak === e1.hash && isPainted(e1) && allStates(t1, e1) && t1.peak !== e1bare.hash && kFiles(K1).every((f) => e1.files.indexOf(f) >= 0), 'every state it drew is the painted composition of that look, pixel for pixel (' + kFiles(K1).join(', ') + ' in the plan), not the look without ' + K1 + ' (' + J({ live: t1.peak, want: e1.hash, without: e1bare.hash, painted: e1.painted }) + ')');

  // ---- unequip → gone from the next composition ------------------------------------------------------------------------------
  ok(await leaveTo(1), 'leaving the encounter: slot 1 loaded in the page');
  const w1b = await worn();
  ok(J(w1b.look) === J(W1) && w1b.cosmetic === K1, 'loaded in the same page: ' + K1 + ' still worn, the same look');
  await p.evaluate(() => RB.equip.unequip(RB.game.s, 'cosmetic'));
  const w0 = await worn();
  ok(w0.cosmetic === null && J(w0.look) === J(L1) && J(w0.world) === J(L1), 'unequip: the worn look is creation look 1 again, on the world sprite too');
  const t2 = await technique();
  const e2 = await expected(L1, t2);
  ok(t2.kind === 'dev' && t2.started === 1 && t2.last && J(t2.last.look) === J(L1) && t2.peak === e2.hash && isPainted(e2) && allStates(t2, e2) && t2.peak !== t1.peak && !kFiles(K1).some((f) => e2.files.indexOf(f) >= 0),
    'the next technique\'s cut-in no longer has it: the painted composition of the plain look, its files gone from the plan (' + J({ live: t2.peak, want: e2.hash, before: t1.peak }) + ')');

  // ---- a second slot with another look ----------------------------------------------------------------------------------------------
  const base2 = await campaign(L2, [K2]);
  await p.evaluate((id) => RB.equip.equip(RB.game.s, id), K2);
  const w2 = await worn();
  const saved2 = await p.evaluate(async () => { const r = await RB.save.manualSave(2); return { look: r.state.player.look, equip: r.state.equip }; });
  ok(J(base2) === J(L2) && J(w2.look) === J(W2) && saved2.equip.cosmetic === K2 && J(saved2.look) === J(L2), 'slot 2: another campaign, creation look 2 (' + L2.hair + ', ' + L2.shape + ') with ' + K2 + ' worn (' + W2.acc.join('+') + ', ' + J(KS[K2].wear) + ')');
  const t3 = await technique();
  const e3 = await expected(W2, t3);
  ok(t3.peak != null && t3.peak === e3.hash && isPainted(e3) && allStates(t3, e3) && J(t3.last.look) === J(W2) && kFiles(K2).every((f) => e3.files.indexOf(f) >= 0), 'slot 2\'s technique: its own painted composition (' + kFiles(K2).join(', ') + ' in the plan)');
  ok(await leaveTo(1), 'slot 1 loaded again in the same page');
  const t4 = await technique();
  ok(J(t4.last.look) === J(W1) && t4.peak === t1.peak, 'slot 1\'s technique after slot 2\'s: the same look and the same pixels as the first time (' + t4.peak + ')');
  ok(await leaveTo(1), 'leaving the encounter before the reload');
  const ref1 = await gameComp();
  ok(await leaveTo(2), 'slot 2 loaded');
  const ref2 = await gameComp();
  ok(isPainted(ref1) && isPainted(ref2) && ref1.hash !== ref2.hash, 'before the reload: the game\'s composition of each slot\'s worn look (' + ref1.hash + ', ' + ref2.hash + ')');

  const fbA = await p.evaluate(() => ({ raster: RB.harmonyRaster.stats().fallbackLog, cutin: RB.harmonyCutin.stats().fallbacks }));
  ok(!fbA.raster.length && !fbA.cutin.length, 'before the reload: no bust drawn in code, not even while decoding, no cut-in omitted (' + J(fbA).slice(0, 300) + ')');

  // ---- reload, then load each slot ---------------------------------------------------------------------------------------------------
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 30000 });
  await boot();
  await helpers(p);
  const fresh = await p.evaluate(() => ({ playing: !!(RB.game.s && RB.game.s.player), decoded: RB.harmonyRaster.stats().decoded, mode: RB.save.status().mode }));
  ok(!fresh.playing && fresh.decoded === 0 && fresh.mode === 'idb', 'a reloaded page: the title, nothing decoded, the same storage');
  ok(await p.evaluate(async () => { RB.ui.title.hide(); return RB.game.loadCampaign(1); }), 'after the reload: slot 1 loads');
  const r1 = await worn(), g1 = await gameComp();
  ok(J(r1.look) === J(W1) && r1.cosmetic === K1 && J(r1.world) === J(W1), 'slot 1 after the reload: ' + K1 + ' worn, the same look as saved');
  ok(g1.hash === ref1.hash && isPainted(g1), 'slot 1 after the reload: the same composition, pixel for pixel (' + g1.hash + ')');
  const t5 = await technique();
  ok(t5.peak === t1.peak && J(t5.last.look) === J(W1), 'slot 1 after the reload: the next technique\'s cut-in is the same, pixel for pixel');
  ok(await leaveTo(2), 'slot switch: slot 2 loads');
  const r2 = await worn(), g2 = await gameComp();
  const stale2 = g2.busts.concat(g2.comps).filter((k) => k.endsWith(r1.key));
  ok(J(r2.look) === J(W2) && r2.cosmetic === K2 && g2.hash === ref2.hash && g2.hash !== ref1.hash && isPainted(g2) && !stale2.length, 'slot 2 after slot 1: its own look and composition, pixel for pixel, and nothing cached under slot 1\'s look (' + stale2.length + ' stale entries)');
  const t6 = await technique();
  ok(t6.peak === t3.peak && J(t6.last.look) === J(W2), 'slot 2\'s next technique: the same cut-in as before the reload');
  ok(await leaveTo(1), 'slot switch back: slot 1 loads');
  const r1b = await worn(), g1b = await gameComp();
  const stale1 = g1b.busts.concat(g1b.comps).filter((k) => k.endsWith(r2.key));
  ok(J(r1b.look) === J(W1) && g1b.hash === ref1.hash && !stale1.length, 'slot 1 again: its own composition, nothing cached under slot 2\'s look (' + stale1.length + ' stale entries)');
  const fb = await p.evaluate(() => ({ raster: RB.harmonyRaster.stats().fallbackLog, cutin: RB.harmonyCutin.stats().fallbacks }));
  ok(!fb.raster.length && !fb.cutin.length, 'after the reload: no bust drawn in code, not even while decoding, no cut-in omitted (' + J(fb).slice(0, 300) + ')');
  ok(!errors.length && !requests.length, 'part B: no page errors, no network requests (' + errors.concat(requests).slice(0, 4).join('; ') + ')');
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed (' + secs() + ')');
process.exit(fail ? 1 : 0);
