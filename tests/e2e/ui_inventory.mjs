// U00 (expansion playbook §15A): an inventory of the Wayfarer's Ledger as it stands, before the book interface.
// Opens every section and sub-page in a fixture like Robin's save (Saltglass, the main road at "go deeper into the
// archive", two side requests, Suzu, a cat called Samson) and records every control: what it says, what it does
// (its data-* action), its state, its size, and which part of the page it sits in. Also counts the framed boxes on
// each page (the "rectangles inside rectangles" Robin described), reads which fonts the browser really used, and
// saves baseline captures at desktop and phone sizes.
// Usage: node tests/e2e/ui_inventory.mjs [outDir] [shotDir]   (defaults: docs/future/work, docs/screenshots/book/baseline)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.resolve(root, process.argv[2] || 'docs/future/work');
const shotDir = path.resolve(root, process.argv[3] || 'docs/screenshots/book/baseline');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(shotDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const problems = [];

// a save shaped like Robin's: Saltglass, Suzu, Samson the cat, the main road followed
const FIXTURE = () => {
  const s = RB.game.debugStart('sg.harbor', 20, 22, { comp: 'suzu', flags: { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true } });
  s.player.name = 'Robin';
  s.chapter = 2;
  s.playtime = 3 * 3600 + 27 * 60;
  const T = Date.now();
  s.quests = {
    rw_labels: { stage: 2, done: true, t: T - 9000 }, rw_mill: { stage: 4, done: true, t: T - 8000 }, rw_depart: { stage: 1, done: true, t: T - 7000 },
    sg_main: { stage: 8, done: false, t: T - 100 }, sg_cove: { stage: 1, done: false, t: T - 300 }, sg_seaglass: { stage: 1, done: false, t: T - 400 },
  };
  RB.pets.meet(s, 'cat', { map: 'sg.harbor' }); RB.pets.select(s, 'cat'); s.company.pets.cat.name = 'Samson';
  RB.company.sync && RB.company.sync(s, 'live');
  s.backlog.push({ who: 'suzu', jp: '{港|みなと} の {客|きゃく} は {厳|きび}しい ねん 。', en: 'Harbour audiences are tough.' });
  RB.questGuide.follow('sg_main');
  return true;
};

// everything interactive inside the open folio, with where it sits and what it does
const COLLECT = () => {
  const root = document.querySelector('.folio');
  if (!root) return null;
  const zone = (el) => el.closest('.folio-head') ? 'head' : el.closest('.tabslot') ? 'tabs' : el.closest('.folio-foot') ? 'foot' : el.closest('.leaf-b') ? 'leaf B (detail)' : el.closest('.leaf') ? 'leaf A' : 'other';
  const sel = 'button, a[href], input, select, textarea, summary, [role="tab"], [role="button"], [role="radio"], [tabindex="0"]';
  const out = [];
  for (const el of root.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const data = {};
    for (const a of el.attributes) if (a.name.startsWith('data-')) data[a.name] = a.value;
    const st = {};
    for (const k of ['aria-pressed', 'aria-selected', 'aria-expanded', 'aria-current', 'aria-checked', 'aria-disabled']) if (el.hasAttribute(k)) st[k] = el.getAttribute(k);
    if (el.disabled) st.disabled = true;
    out.push({ zone: zone(el), tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || null, text: (el.innerText || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 90), label: el.getAttribute('aria-label') || null, data, state: st, w: Math.round(r.width), h: Math.round(r.height), cls: el.className && el.className.baseVal === undefined ? el.className : null });
  }
  // framed boxes: elements inside the pages with their own visible border, shadow or a background unlike their parent's
  const bg = (e) => getComputedStyle(e).backgroundColor;
  let framed = 0;
  for (const el of root.querySelectorAll('.leafbox *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 16) continue;
    const border = ['Top', 'Right', 'Bottom', 'Left'].filter((k) => parseFloat(cs['border' + k + 'Width']) > 0 && cs['border' + k + 'Style'] !== 'none' && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs['border' + k + 'Color'])).length;
    const fill = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.parentElement && cs.backgroundColor !== bg(el.parentElement);
    if (border >= 3 || cs.boxShadow !== 'none' || fill) framed++;
  }
  return { controls: out, framed, title: (document.querySelector('.folio-head h2') || {}).innerText || '' };
};

const results = { fixture: 'Saltglass, sg_main stage 8 followed, sg_cove and sg_seaglass active, Suzu, Samson the cat, 3:27 played', viewports: {}, fonts: null, guidance: null };

for (const vp of [{ id: 'desktop', width: 1440, height: 900 }, { id: 'phone', width: 375, height: 667, mobile: true, touch: true }]) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: vp.width, height: vp.height }, mobile: vp.mobile, touch: vp.touch });
  await p.evaluate(FIXTURE);
  await p.waitForTimeout(400);
  const pages = [];
  const visit = async (label, shot) => {
    await p.waitForTimeout(250);
    const c = await p.evaluate(COLLECT);
    if (!c) { problems.push(vp.id + ' ' + label + ': folio not open'); fail++; return; }
    pages.push(Object.assign({ page: label }, c));
    if (shot) await p.screenshot({ path: path.join(shotDir, vp.id + '_' + shot + '.png') });
  };
  for (const section of ['journey', 'words', 'satchel', 'map', 'company']) {
    await p.evaluate((sec) => { RB.ui.menu.close(); RB.ui.menu.open(sec); }, section);
    await visit(section, section);
    // every sub-page the section offers (Journey views, Words pages, Map views, Company pages)
    const subs = await p.evaluate(() => [...document.querySelectorAll('.folio [data-jv], .folio [data-sub], .folio [data-mv], .folio [data-cp]')].map((e) => { const k = ['jv', 'sub', 'mv', 'cp'].find((x) => e.dataset[x] !== undefined); return { k, v: e.dataset[k] }; }));
    const seen = new Set();
    for (const sb of subs) {
      if (seen.has(sb.k + sb.v)) continue;
      seen.add(sb.k + sb.v);
      await p.evaluate(({ sec, sb }) => { RB.ui.menu.close(); RB.ui.menu.open(sec); const e = document.querySelector('.folio [data-' + sb.k + '="' + sb.v + '"]'); if (e) e.click(); }, { sec: section, sb });
      await visit(section + ' › ' + sb.v, section === 'company' && sb.v === 'companion' ? null : null);
    }
  }
  // the Company › Companion page as in Robin's screenshot
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('companion'); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(shotDir, vp.id + '_company_companion.png') });
  // the Journey's quest detail with the guidance (Robin's first screenshot)
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('journal'); });
  await p.waitForTimeout(300);
  if (vp.id === 'phone') await p.evaluate(() => { const e = document.querySelector('.folio [data-q="sg_main"]'); if (e) e.click(); });
  await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(shotDir, vp.id + '_journey_quest.png') });
  if (vp.id === 'desktop') {
    // the "Next" lines: what the guidance data says, so the two near-identical lines can be judged
    results.guidance = await p.evaluate(() => { const G = RB.questGuide, s = RB.game.s; const N = G.nudges('sg_main', s); return { result: JSON.parse(JSON.stringify(N.result, (k, v) => (typeof v === 'function' ? undefined : v))), next: G.nextLines(N.result).map((l) => l.en) }; });
    // which fonts the browser really drew with, for each text role
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root: docRoot } = await cdp.send('DOM.getDocument', { depth: -1 });
    const ROLES = { 'folio title': '.folio-head h2', 'section tab label': '.ptab .tl', 'quest title (Japanese with furigana)': '.qdetail h3', 'furigana (rt)': '.qdetail h3 rt', 'English line': '.qdetail .en-title', 'stage text (Japanese)': '.qdetail .obj', 'button label': '.qdetail .pbtn span', 'meta (playtime)': '.folio-head .meta' };
    results.fonts = {};
    for (const [role, q] of Object.entries(ROLES)) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: docRoot.nodeId, selector: q });
      if (!nodeId) { results.fonts[role] = { selector: q, missing: true }; continue; }
      const used = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      const fam = await p.evaluate((q) => { const e = document.querySelector(q); const cs = getComputedStyle(e); return { family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight }; }, q);
      results.fonts[role] = Object.assign({ selector: q, used: used.fonts.map((f) => f.familyName + ' (' + f.glyphCount + ' glyphs' + (f.isCustomFont ? ', web font' : '') + ')') }, fam);
    }
    // a dialogue line on screen, for the dialogue strip's baseline
    await p.evaluate(() => { RB.ui.menu.close(); RB.script.run && RB.script.run('sg.road_bench'); });
    await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(shotDir, vp.id + '_dialogue.png') });
  }
  results.viewports[vp.id] = { width: vp.width, height: vp.height, pages };
  if (errors.length) { problems.push(vp.id + ': ' + errors.slice(0, 3).join('; ')); fail++; }
  await ctx.close();
}

// convert captures to WebP alongside (the repo keeps WebP), then drop the PNGs
{
  const { p, ctx } = await page(b, url, { viewport: { width: 400, height: 300 } });
  for (const f of fs.readdirSync(shotDir).filter((x) => x.endsWith('.png'))) {
    const b64 = fs.readFileSync(path.join(shotDir, f)).toString('base64');
    const data = await p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', 0.86); }, b64);
    fs.writeFileSync(path.join(shotDir, f.replace(/\.png$/, '.webp')), Buffer.from(data.split(',')[1], 'base64'));
    fs.unlinkSync(path.join(shotDir, f));
  }
  await ctx.close();
}

fs.writeFileSync(path.join(outDir, 'ui_inventory.json'), JSON.stringify(results, null, 1) + '\n');
const tot = (id) => results.viewports[id].pages.reduce((n, pg) => n + pg.controls.length, 0);
console.log('pages: desktop ' + results.viewports.desktop.pages.length + ', phone ' + results.viewports.phone.pages.length + '; controls recorded: desktop ' + tot('desktop') + ', phone ' + tot('phone'));
console.log('fonts: ' + Object.entries(results.fonts).map(([k, v]) => k + ' → ' + (v.used || ['?']).join(' + ')).join(' | '));
console.log('next lines: ' + JSON.stringify(results.guidance && results.guidance.next));
for (const pr of problems) console.log('PROBLEM ' + pr);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
