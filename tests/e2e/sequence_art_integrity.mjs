// AR-1 (Robin, 2026-10-13: "reconcile the art issues across all the illustrations"): every illustrated shot drawn
// directly (RB.sequence.drawAt, the dev fixture traveller, each companion) in the BUILT game at 1280×720, 390×844 and
// 844×390, and checked for three faults the art pass found and fixed:
//   1. unpainted pixels: the player draws a shot over the last frame without clearing, so anything a shot leaves
//      transparent shows the previous picture (checked at each phase's start and end);
//   2. a hand placed past its arm's reach: the drawn arm then stretches (RB.portraitBody.over, at each phase's
//      start, quarter points and end);
//   3. a drawing error.
// Usage: node tests/e2e/sequence_art_integrity.mjs [--quick]   (--quick: one companion per size)
import { serve, launch, page } from './lib.mjs';

const QUICK = process.argv.includes('--quick');
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const SIZES = [[1280, 720], [390, 844], [844, 390]];
const COMPS = ['nao', 'mio', 'suzu', 'ren'];
const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 60000 });
for (const [si, [W, H]] of SIZES.entries()) {
  const comps = QUICK ? [COMPS[si % COMPS.length]] : COMPS;
  const r = await p.evaluate(([W, H, comps]) => {
    const FIX = RB.seqDev.FIX, PC = RB.seqDev.PC, out = { holes: [], over: [], errs: [], draws: 0, shots: 0 };
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    for (const cid of comps) {
      const cast = { pc: PC, comp: { id: cid, look: (RB.content.chars[cid] || {}).look || {} } };
      const test = (cond) => !cond || cond.split('|').some((alt) => alt.split('&').every((t) => { t = t.trim(); const neg = t[0] === '!'; if (neg) t = t.slice(1); const v = t.startsWith('comp=') ? t.slice(5) === cid : !!FIX.flags[t]; return neg ? !v : v; }));
      for (const id of RB.sequence.ids()) {
        const d = RB.sequence.get(id);
        for (const s of Object.keys(d.shots)) {
          out.shots++;
          for (const ph of d.shots[s].phases.map((x) => x.id)) {
            for (const k of [0, 0.25, 0.5, 0.75, 1]) {
              g.clearRect(0, 0, W, H);
              RB.portraitBody.over.length = 0;
              try { RB.sequence.drawAt(g, W, H, { seq: id, shot: s, phase: ph, k, vb: Math.round(H * 0.64), t: 4000, cast, test }); } catch (e) { out.errs.push(id + '.' + s + ' ' + ph + ' ' + String(e).slice(0, 100)); continue; }
              out.draws++;
              if (RB.portraitBody.over.length) out.over.push(id + '.' + s + ' ' + ph + '@' + k + ' ' + cid + ' ' + JSON.stringify(RB.portraitBody.over[0]));
              if (k === 0 || k === 1) {
                const a = g.getImageData(0, 0, W, H).data; let n = 0;
                for (let i = 3; i < a.length; i += 4) if (a[i] < 250) n++;
                if (n) out.holes.push(id + '.' + s + ' ' + ph + '@' + k + ' ' + cid + ': ' + n + ' px');
              }
            }
          }
        }
      }
    }
    return out;
  }, [W, H, comps]);
  const tag = W + '×' + H + ' (' + comps.join(', ') + ')';
  ok(r.shots > 100 && r.draws > 500, tag + ': ' + r.shots + ' shots, ' + r.draws + ' drawings');
  ok(!r.errs.length, tag + ': every shot draws without an error ' + JSON.stringify(r.errs.slice(0, 3)));
  ok(!r.holes.length, tag + ': every shot paints its whole frame at each phase\'s start and end ' + JSON.stringify(r.holes.slice(0, 4)));
  ok(!r.over.length, tag + ': every hand a shot places is within its arm\'s reach ' + JSON.stringify(r.over.slice(0, 4)));
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await ctx.close();
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
