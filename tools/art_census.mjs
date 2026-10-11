// The art census (expansion P16; playbook V12, AC-1's AC-A18): what the game draws and where each piece stands,
// read from the game's own registries, so the art pass works from what is really there rather than a list kept by hand.
//   node tools/art_census.mjs            prints the summary and writes docs/future/work/art_census.json
//   node tools/art_census.mjs --check    exits 1 if anything the census can measure is missing (a cosmetic with no
//                                        drawing where it is worn, a volume page with neither a painting nor a plate)
// What it measures is structure (a drawing exists, a family is the creature's own, a page has its painting), never
// whether the art is good: that is the captures' and the reviewer's job (docs/future/work/P16_ART.md).
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../tests/lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const C = RB.content;
const out = { generated: 'tools/art_census.mjs', maps: {}, regions: {}, creatures: {}, volume: {}, cosmetics: {}, characters: {} };
const problems = [];

// ---- regional kits: a region whose art file says its assets are interim ---------------------------------------------
const contentDir = path.join(root, 'src', 'content');
for (const d of fs.readdirSync(contentDir)) {
  const f = path.join(contentDir, d, '02_art.js');
  if (!fs.existsSync(f)) continue;
  const head = fs.readFileSync(f, 'utf8').split('*/')[0];
  out.regions[d] = { kit: /interim/i.test(head) ? 'interim' : 'final', file: path.relative(root, f) };
}

// ---- maps ---------------------------------------------------------------------------------------------------------
for (const [id, m] of Object.entries(C.maps)) {
  const pre = id.split('.')[0];
  const kit = out.regions[pre] ? out.regions[pre].kit : 'final';
  out.maps[id] = { region: m.region || null, edition: m.edition || 1, kit, props: (m.props || []).length, npcs: (m.npcs || []).length, states: m.alt ? Object.keys(m.alt).length : 0 };
}

// ---- creatures ------------------------------------------------------------------------------------------------------
const AA = (RB.creaturesA && RB.creaturesA.audit && RB.creaturesA.audit.enemies) || {};
const AB = (RB.creaturesB && RB.creaturesB.AUDIT) || {};
for (const [id, e] of Object.entries(C.enemies)) {
  const a = AA[id] || AB[id] || {};
  const txt = (a.disposition || '') + ' ' + (a.note || '');
  out.creatures[id] = { family: e.art, boss: !!e.boss, disposition: a.disposition || null, own: !/interim|incomplete/i.test(txt) };
}

// ---- the travel volume --------------------------------------------------------------------------------------------
const pages = RB.volume.pages();
for (const p of pages) {
  const painted = !!(p.seq && RB.sequence.get(p.seq));
  out.volume[p.id] = { no: p.no, key: p.key, painted, plate: !painted && !!p.plate };
  if (!painted && !p.plate) problems.push('volume page ' + p.id + ' has neither a painting nor a plate');
}
const keysWithPages = new Set(pages.map((p) => p.key));
const missingChapters = RB.edition.ORDER.filter((k) => !keysWithPages.has(k));

// ---- cosmetics: where each is worn and whether that view draws it -----------------------------------------------------
const SP = (RB.sprites && RB.sprites._art) || {};
const spriteAcc = new Set(Object.keys((SP && SP.ACC) || {}).concat(Object.keys((RB.atlasArt && RB.atlasArt.ACC) || {})));
const src = (f) => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const portraitSrc = src('engine/35_portraits.js'), battlerSrc = src('engine/34_battlers.js');
const HK = RB.harmonyKit || {};
const harmonyDrawn = new Set(Object.keys(HK.acc || {}));
const harmonyNot = HK.ACC_NOT_SHOWN || {};
for (const [id, it] of Object.entries(C.items)) {
  if (it.slot !== 'cosmetic' || !it.acc) continue;
  const a = it.acc;
  const rec = {
    acc: a,
    sprite: spriteAcc.has(a),
    portrait: portraitSrc.includes("includes('" + a + "')"),
    battler: battlerSrc.includes("case '" + a + "'"),
    harmony: harmonyDrawn.has(a) ? 'drawn' : harmonyNot[a] ? 'not shown: ' + harmonyNot[a] : 'missing',
  };
  out.cosmetics[id] = rec;
  for (const v of ['sprite', 'portrait', 'battler']) if (!rec[v]) problems.push('cosmetic ' + id + ' (' + a + ') has no ' + v + ' drawing');
  if (rec.harmony === 'missing') problems.push('cosmetic ' + id + ' (' + a + ') has no Harmony bust drawing or reason');
  // a keepsake the traveller can wear is a player option, whatever an older reason said
  if (/not a player option/.test(rec.harmony)) problems.push('cosmetic ' + id + ' (' + a + ') is worn by the traveller but the Harmony bust calls it "not a player option"');
}

// ---- characters -------------------------------------------------------------------------------------------------------
for (const [id, ch] of Object.entries(C.chars)) out.characters[id] = { look: !!ch.look, portrait: !!(ch.look || ch.portrait) };

// ---- summary ------------------------------------------------------------------------------------------------------------
const n = (o, f) => Object.values(o).filter(f).length;
const regionsInterim = Object.entries(out.regions).filter(([, r]) => r.kit === 'interim').map(([k]) => k);
const famInterim = {};
for (const [id, c] of Object.entries(out.creatures)) if (!c.own) (famInterim[c.family] = famInterim[c.family] || []).push(id);
out.summary = {
  maps: Object.keys(out.maps).length,
  mapsOnInterimKits: n(out.maps, (m) => m.kit === 'interim'),
  regionsInterim,
  creatures: Object.keys(out.creatures).length,
  creaturesInterim: n(out.creatures, (c) => !c.own),
  volumePages: pages.length,
  volumePainted: n(out.volume, (v) => v.painted),
  volumePlates: n(out.volume, (v) => v.plate),
  chaptersWithoutPages: missingChapters,
  cosmetics: Object.keys(out.cosmetics).length,
  characters: Object.keys(out.characters).length,
  problems,
};
const file = path.join(root, 'docs', 'future', 'work', 'art_census.json');
if (!process.argv.includes('--check')) fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
const S = out.summary;
console.log('maps ' + S.maps + ' (' + S.mapsOnInterimKits + ' on interim regional kits: ' + S.regionsInterim.join(', ') + ')');
console.log('creatures ' + S.creatures + ' (' + S.creaturesInterim + ' on a borrowed family)');
for (const [f, ids] of Object.entries(famInterim)) console.log('  ' + f.padEnd(12) + ids.length + '  ' + ids.join(' '));
console.log('volume pages ' + S.volumePages + ': ' + S.volumePainted + ' painted, ' + S.volumePlates + ' interim plates; chapters with no page: ' + (S.chaptersWithoutPages.join(', ') || 'none'));
console.log('cosmetics ' + S.cosmetics + ', characters ' + S.characters);
for (const p of problems) console.log('PROBLEM ' + p);
if (process.argv.includes('--check') && problems.length) process.exit(1);
