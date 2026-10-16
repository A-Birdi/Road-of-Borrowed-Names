// A contact sheet of the item icons (LI-2, src/ui/11_item_art.js) on the built index.html: each item's icon at 4× and
// 2× on the page's paper, at 2× on the cover's cloth, with its id, its name and what it is, so a drawing can be judged
// against what it should show at the sizes the game uses. Items without an icon yet show the fallback line drawing.
// Usage: node tools/art/item_icons_sheet.mjs --out <file.png> [--only rw,sg,cs] [--cols 4]
import { serve, launch, page } from '../../tests/e2e/lib.mjs';

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const out = arg('--out', 'item_icons.png');
const only = (arg('--only', '') || '').split(',').filter(Boolean);
const cols = +arg('--cols', 4);
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url, { viewport: { width: 330 * cols + 40, height: 900 } });
const n = await p.evaluate(([only, cols]) => {
  const C = RB.content.items;
  const ids = Object.keys(C).filter((id) => !only.length || only.includes(id.split('_')[0])).sort();
  const esc = RB.util.esc;
  const host = document.createElement('div');
  host.id = 'sheet';
  host.style.cssText = 'position:fixed;inset:0;z-index:999999;overflow:auto;background:#efe3c6;padding:16px;font:12px/1.3 sans-serif;color:#261f15;display:grid;grid-template-columns:repeat(' + cols + ', 320px);gap:10px;align-content:start';
  host.innerHTML = ids.map((id) => {
    const d = C[id];
    const has = RB.itemArt.has(id);
    const probs = has ? RB.itemArt.problems(id) : ['no icon yet'];
    return '<div style="display:grid;grid-template-columns:64px 32px 40px 1fr;gap:8px;align-items:center;border:1px solid ' + (probs.length ? '#a83e27' : '#a8966c') + ';padding:6px;background:#f2e9d3">' +
      RB.itemArt.html(id, 4) + RB.itemArt.html(id, 2) + '<span style="background:#1c2346;padding:4px;line-height:0">' + RB.itemArt.html(id, 2) + '</span>' +
      '<span><b>' + esc(id) + '</b><br>' + esc(d.name.en) + (d.slot ? ' <i>(' + esc(d.slot) + ')</i>' : '') + '<br><span style="color:#62553f">' + esc(String((d.desc && d.desc.en) || d.desc || '').slice(0, 90)) + '</span>' +
      (probs.length ? '<br><span style="color:#a83e27">' + esc(probs.join('; ')) + '</span>' : '') + '</span></div>';
  }).join('');
  document.body.appendChild(host);
  document.querySelectorAll('#sheet img.it-ic').forEach((i) => { i.style.imageRendering = 'pixelated'; });
  return ids.length;
}, [only, cols]);
await p.waitForTimeout(300);
const h = await p.evaluate(() => document.getElementById('sheet').scrollHeight + 32);
await p.setViewportSize({ width: 330 * cols + 40, height: Math.min(16000, h) });
await p.waitForTimeout(200);
await p.screenshot({ path: out, fullPage: false });
console.log(n + ' items → ' + out + (errors.length ? '  page errors: ' + errors.join('; ') : ''));
await b.close(); srv.close();
