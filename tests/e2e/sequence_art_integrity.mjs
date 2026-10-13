// AR-1 / AR-2 (Robin, 2026-10-13: "reconcile the art issues across all the illustrations"; "any other illustration
// oddities … animations, framing"): every illustrated shot drawn directly (RB.sequence.drawAt, the dev fixture traveller,
// each companion) in the BUILT game at the sizes the game really draws them (its art buffer, RB.render: 640 × 360 for a
// 16:9 desktop window at 1×–1.5×, 683 × 349 for 2048 × 1046, 390 × 844 for an upright phone, 563 × 260 for a phone on
// its side) and the travel volume's 320 × 180 page, and checked for the faults the art passes found and fixed:
//   1. unpainted pixels: the player draws a shot over the last frame without clearing, so anything a shot leaves
//      transparent shows the previous picture (checked at each phase's start and end);
//   2. a hand placed past its arm's reach: the drawn arm then stretches (RB.portraitBody.over);
//   3. a hand with nothing holding it up: neither a figure's arm (a portrait's, a back figure's), nor a forearm drawn
//      to it (RB.seqKit.forearm), nor its cuff running off the frame (AR-2 found a dozen hands floating in mid-air);
//   4. a face (a portrait's eyes to mouth) not wholly in the frame and above the dialogue sheet when the action is over;
//   5. a jump where one phase hands over to the next: the end of a phase and the start of the next must be the same
//      picture (AR-2 found speakers snapping back at the next line), at 640 × 360;
//   6. a drawing error.
// Usage: node tests/e2e/sequence_art_integrity.mjs [--quick]   (--quick: one companion per size)
import { serve, launch, page } from './lib.mjs';

const QUICK = process.argv.includes('--quick');
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
// [width, height, the sheet's top as a fraction of the height (the game's default; a phone on its side has the sheet
// over most of it), label]
const SIZES = [[640, 360, 0.64, 'desktop'], [683, 349, 0.64, '2048x1046'], [390, 844, 0.64, 'phone'], [563, 260, 0.44, 'phone on its side'], [320, 180, 0.64, 'volume page']];
const COMPS = ['nao', 'mio', 'suzu', 'ren'];
// hands held by an arm the shot draws in its own way (not through the kit), checked by eye (AR-2)
const HELD = {
  'ch1.bridge.hana': 'Kōji\'s cup hand at the end of the forward arm his back figure draws',
  'ch6.ren.ren': 'Ren\'s hands on the glasses, held by their own bare-faced bust\'s arms',
  'ch6.toya.bell': 'the arm with the bell, drawn by the shot',
  'ch6.toya.folio': 'Kasane\'s hands from the sleeves of their robe, kneeling',
  'ch6.toya.turned': 'Kasane\'s hands from the sleeves of their robe, kneeling',
  'ch6.toya.decide|nao': 'Nao\'s hand on the strap at their shoulder, seen from behind (the forearm is in front of them)',
};
const FACE = [32, 26, 64, 62]; // a 96-px portrait's face, eyes to mouth

const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 60000 });
// test-only instrumentation: where each portrait, hand, back figure's arm and forearm lands on the canvas checked,
// through intermediate canvases and transforms
await p.evaluate(() => {
  const tags = new WeakMap(), A = { main: null, rec: [], ends: [] }, kit = RB.seqKit;
  const kb = kit.bust;
  kit.bust = function (who, expr, fr, g, flip, ext, o) {
    const r = kb.apply(this, arguments);
    if (r && r.cv) {
      const holds = [], ar = o && o.arms;
      if (ar) for (const k of ['l', 'r']) if (ar[k] && ar[k].hold) holds.push([flip ? 96 - ar[k].hold[0] : ar[k].hold[0], ar[k].hold[1]]);
      tags.set(r.cv, [{ kind: 'bust', who: typeof who === 'string' ? who : who && who.id ? who.id : 'pc', x: r.ax - 48, y: r.ay - 96, s: 1, flip: !!flip, holds }]);
    }
    return r;
  };
  const kh = kit.hand;
  kit.hand = function (o) { const r = kh.apply(this, arguments); if (r && r.cv) tags.set(r.cv, [{ kind: 'hand', x: r.ax, y: r.ay, s: 1 / 96, S: o.size, side: o.side || 'R', angle: o.angle || 0 }]); return r; };
  const kf = kit.forearm;
  kit.forearm = function (c, wx, wy) { if (c === A.main) { const m = c.getTransform(); A.ends.push([m.a * wx + m.c * wy + m.e, m.b * wx + m.d * wy + m.f]); } return kf.apply(this, arguments); };
  const ba = RB.seqBack.arm;
  RB.seqBack.arm = function (lk, W, wx, wy) { const r = ba.apply(this, arguments); if (r && r.cv) tags.set(r.cv, [{ kind: 'arm', x: r.ox + wx, y: r.oy + wy, s: 1 / 96 }]); return r; };
  const P = CanvasRenderingContext2D.prototype, di = P.drawImage, cr = P.clearRect;
  P.drawImage = function (src) {
    const t = src && tags.get(src);
    if (t) {
      const a = arguments; let sx = 0, sy = 0, sw = src.width, sh = src.height, dx, dy, dw, dh;
      if (a.length === 3) { dx = a[1]; dy = a[2]; dw = sw; dh = sh; } else if (a.length === 5) { dx = a[1]; dy = a[2]; dw = a[3]; dh = a[4]; } else { sx = a[1]; sy = a[2]; sw = a[3]; sh = a[4]; dx = a[5]; dy = a[6]; dw = a[7]; dh = a[8]; }
      const m = this.getTransform(), kx = dw / sw, ky = dh / sh, tr = (x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
      const out = t.map((q) => {
        const p0 = tr(dx + (q.x - sx) * kx, dy + (q.y - sy) * ky), p1 = tr(dx + (q.x - sx) * kx + 96 * q.s * kx, dy + (q.y - sy) * ky + 96 * q.s * ky);
        const holds = q.holds ? q.holds.map((h) => tr(dx + (q.x + h[0] - sx) * kx, dy + (q.y + h[1] - sy) * ky)) : undefined;
        return Object.assign({}, q, { x: Math.min(p0[0], p1[0]), y: Math.min(p0[1], p1[1]), s: Math.abs(p1[0] - p0[0]) / 96, flip: !!q.flip !== (m.a < 0), holds });
      });
      if (this === A.main) A.rec.push(...out);
      else if (this.canvas) { const old = tags.get(this.canvas) || []; for (const q of out) if (!old.some((o) => o.kind === q.kind && Math.abs(o.x - q.x) < 1 && Math.abs(o.y - q.y) < 1)) old.push(q); tags.set(this.canvas, old); }
    }
    return di.apply(this, arguments);
  };
  P.clearRect = function (x, y, w, h) { if (this !== A.main && this.canvas && x <= 0 && y <= 0 && w >= this.canvas.width && h >= this.canvas.height) tags.delete(this.canvas); return cr.apply(this, arguments); };
  window.__artIntegrity = { begin: (g) => { A.main = g; A.rec = []; A.ends = []; }, end: () => { const r = { rec: A.rec, ends: A.ends }; A.main = null; A.rec = []; A.ends = []; return r; } };
});
for (const [si, [W, H, VBF, label]] of SIZES.entries()) {
  const comps = QUICK ? [COMPS[si % COMPS.length]] : COMPS;
  const r = await p.evaluate(([W, H, VBF, comps, HELD, FACE, bounds]) => {
    const FIX = RB.seqDev.FIX, PC = RB.seqDev.PC, out = { holes: [], over: [], errs: [], faces: [], hands: [], jumps: [], draws: 0, shots: 0, handsSeen: 0, facesSeen: 0 };
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }), vb = Math.round(H * VBF), I = window.__artIntegrity;
    for (const cid of comps) {
      const cast = { pc: PC, comp: { id: cid, look: (RB.content.chars[cid] || {}).look || {} } };
      const test = (cond) => !cond || cond.split('|').some((alt) => alt.split('&').every((t) => { t = t.trim(); const neg = t[0] === '!'; if (neg) t = t.slice(1); const v = t.startsWith('comp=') ? t.slice(5) === cid : !!FIX.flags[t]; return neg ? !v : v; }));
      const draw = (id, s, ph, k) => { g.clearRect(0, 0, W, H); RB.sequence.drawAt(g, W, H, { seq: id, shot: s, phase: ph, k, vb, t: 4000, cast, test }); };
      for (const id of RB.sequence.ids()) {
        const d = RB.sequence.get(id);
        for (const s of Object.keys(d.shots)) {
          out.shots++;
          const phs = d.shots[s].phases;
          for (const ph of phs.map((x) => x.id)) {
            for (const k of [0, 0.25, 0.5, 0.75, 1]) {
              RB.portraitBody.over.length = 0;
              I.begin(g);
              try { draw(id, s, ph, k); } catch (e) { I.end(); out.errs.push(id + '.' + s + ' ' + ph + ' ' + String(e).slice(0, 100)); continue; }
              const P = I.end();
              out.draws++;
              const at = id + '.' + s + ' ' + ph + '@' + k + ' ' + cid;
              if (RB.portraitBody.over.length) out.over.push(at + ' ' + JSON.stringify(RB.portraitBody.over[0]));
              // faces, once the action is over: wholly in the frame and above the sheet (during it people may walk in)
              if (k === 1) for (const q of P.rec.filter((q) => q.kind === 'bust')) {
                out.facesSeen++;
                const x0 = q.x + (q.flip ? 96 - FACE[2] : FACE[0]) * q.s, x1 = q.x + (q.flip ? 96 - FACE[0] : FACE[2]) * q.s, y0 = q.y + FACE[1] * q.s, y1 = q.y + FACE[3] * q.s;
                if (x0 < -0.5 || x1 > W + 0.5 || y0 < -0.5 || y1 > vb + 0.5) out.faces.push(at + ' ' + q.who + ' face ' + [x0, y0, x1, y1].map(Math.round).join(','));
              }
              // hands: held by an arm, a forearm, or running off the frame
              if (!HELD[id + '.' + s] && !HELD[id + '.' + s + '|' + cid]) {
                const holds = [].concat(...P.rec.filter((q) => q.kind === 'bust' && q.holds).map((q) => q.holds)), arms = P.rec.filter((q) => q.kind === 'arm').map((q) => [q.x, q.y]);
                for (const q of P.rec.filter((q) => q.kind === 'hand')) {
                  out.handsSeen++;
                  const near = (L, rr) => L.some(([x, y]) => Math.hypot(x - q.x, y - q.y) <= rr);
                  const bx = -Math.cos(q.angle), by = q.side === 'L' ? Math.sin(q.angle) : -Math.sin(q.angle), S = q.S || 10, ex = q.x + bx * S * 1.3, ey = q.y + by * S * 1.3;
                  const held = near(holds, 9) || near(arms, 9) || near(P.ends, 7) || ex < 0 || ey < 0 || ex >= W || ey >= H;
                  if (!held && q.x > -S && q.y > -S && q.x < W + S && q.y < H + S) out.hands.push(at + ' hand at ' + Math.round(q.x) + ',' + Math.round(q.y));
                }
              }
              if (k === 0 || k === 1) {
                const a = g.getImageData(0, 0, W, H).data; let n = 0;
                for (let i = 3; i < a.length; i += 4) if (a[i] < 250) n++;
                if (n) out.holes.push(at + ': ' + n + ' px');
              }
            }
          }
          // a phase's end and the next phase's start: the same picture (a phase with no action of its own changes at once)
          if (bounds && cid === comps[0]) {
            for (let i = 0; i + 1 < phs.length; i++) {
              if (!(phs[i + 1].ms > 0)) continue;
              draw(id, s, phs[i].id, 1); const A1 = g.getImageData(0, 0, W, H).data;
              draw(id, s, phs[i + 1].id, 0); const B1 = g.getImageData(0, 0, W, H).data;
              let n = 0; for (let j = 0; j < A1.length; j++) if (A1[j] !== B1[j]) n++;
              if (n) out.jumps.push(id + '.' + s + ' ' + phs[i].id + '→' + phs[i + 1].id + ': ' + n + ' channel values differ');
            }
          }
        }
      }
    }
    return out;
  }, [W, H, VBF, comps, HELD, FACE, si === 0]);
  const tag = W + '×' + H + ' ' + label + ' (' + comps.join(', ') + ')';
  ok(r.shots > 100 && r.draws > 500, tag + ': ' + r.shots + ' shots, ' + r.draws + ' drawings, ' + r.facesSeen + ' faces, ' + r.handsSeen + ' hands');
  ok(!r.errs.length, tag + ': every shot draws without an error ' + JSON.stringify(r.errs.slice(0, 3)));
  ok(!r.holes.length, tag + ': every shot paints its whole frame at each phase\'s start and end ' + JSON.stringify(r.holes.slice(0, 4)));
  ok(!r.over.length, tag + ': every hand a shot places is within its arm\'s reach ' + JSON.stringify(r.over.slice(0, 4)));
  ok(!r.hands.length, tag + ': every hand is held up by an arm or runs off the frame ' + JSON.stringify(r.hands.slice(0, 4)));
  ok(!r.faces.length, tag + ': every face is wholly in the frame and above the sheet ' + JSON.stringify(r.faces.slice(0, 4)));
  if (si === 0) ok(!r.jumps.length, tag + ': no jump where one phase hands over to the next ' + JSON.stringify(r.jumps.slice(0, 4)));
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await ctx.close();
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
