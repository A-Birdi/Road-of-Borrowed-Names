// Dev helper: node tests/e2e/shot.mjs <out.png> [js-to-eval-before-shot] [waitMs] [WxH]
import { serve, launch, page } from './lib.mjs';
const [out = 'shot.png', code = '', wait = '600', size = '1280x800'] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
const { srv, url } = await serve();
const b = await launch();
const { p, errors, requests } = await page(b, url, { viewport: { width: w, height: h } });
if (code) { const r = await p.evaluate(code); if (r !== undefined) console.log('eval:', JSON.stringify(r).slice(0, 2000)); }
await p.waitForTimeout(+wait);
await p.screenshot({ path: out });
console.log('errors:', errors.length ? errors : 'none', '| external requests:', requests.length ? requests : 'none');
await b.close(); srv.close();
