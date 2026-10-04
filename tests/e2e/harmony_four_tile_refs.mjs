// Reference pages for the four-tile companion sheets (docs/harmony/asset_brief/four_tile/PROMPTS.md): one page per
// companion with their identity (cropped from ../ref_companion_<id>.png, written by harmony_asset_refs.mjs), a
// four-tile pose guide in the framing of Robin's approved Suzu sheet, and the rules. Not part of the default suite;
// an evidence writer like harmony_asset_refs.mjs. Usage: node tests/e2e/harmony_four_tile_refs.mjs [nao mio ren]
import fs from 'node:fs';
import path from 'node:path';
import { launch, root } from './lib.mjs';
import { CHARS, SUZU_FACE } from '../../tools/harmony/four_tile_specs.mjs';

const REPO = path.join(root, 'docs/harmony/asset_brief') + '/';
const OUT = path.join(root, 'docs/harmony/asset_brief/four_tile');
fs.mkdirSync(OUT, { recursive: true });
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CHARS);
const b = await launch();
for (const id of ids) {
  const C = CHARS[id];
  const ref = 'data:image/png;base64,' + fs.readFileSync(`${REPO}ref_companion_${id}.png`).toString('base64');
  const p = await b.newPage({ viewport: { width: 1240, height: 2400 } });
  await p.setContent(`<body style="margin:0;background:#262a36"><canvas id=c width=1240 height=2400></canvas></body>`);
  const h = await p.evaluate(async ({ C, ref, SUZU_FACE }) => {
    const cv = document.getElementById('c'), g = cv.getContext('2d');
    const W = 1240, S = 3, TW = 192 * S, TH = 160 * S;
    g.fillStyle = '#262a36'; g.fillRect(0, 0, W, 2400);
    const font = (px, w = 400) => `${w} ${px}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    const text = (s, x, y, px = 15, col = '#e8e4ec', w = 400) => { g.font = font(px, w); g.fillStyle = col; g.fillText(s, x, y); };
    // wrapped text: returns the y below the last line
    const para = (s, x, y, maxW, px = 14, col = '#d6d0dc', lh = 20, indent = '') => {
      g.font = font(px); g.fillStyle = col; let line = '', yy = y; const words = s.split(' ');
      for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); yy += lh; line = indent + w; } else line = t; }
      if (line) { g.fillText(line, x, yy); yy += lh; } return yy;
    };
    // ---------------------------------------------------------------- header
    text(`${C.name} (${C.pron}; ${C.role}): four-tile Harmony sheet, reference page`, 24, 40, 24, '#ffffff', 700);
    text(`Technique: ${C.technique}. Poses and framing only: paint it in the finish of the attached Suzu sheet, not in the style of these diagrams.`, 24, 68, 15, '#c9c3d0');
    // ---------------------------------------------------------------- identity, cropped from the game's sheet
    const img = new Image(); img.src = ref; await img.decode();
    text('Who they are (from the game, for identity and colour; the painted bust keeps these features at far higher detail)', 24, 104, 15, '#e8e4ec', 600);
    const pw = 1192, ph = Math.round(pw * (300 / 1510));
    g.drawImage(img, 18, 66, 1510, 300, 24, 116, pw, ph);
    const pY = 116 + ph + 10;
    g.drawImage(img, 14, 778, 880, 106, 24, pY, 880 * 0.9, 106 * 0.9);
    let y0 = pY + 106 * 0.9 + 26;
    // ---------------------------------------------------------------- pose guide
    text('Pose guide: 2 × 2 in the same order and framing as the Suzu sheet (top left, top right, bottom left, bottom right)', 24, y0, 15, '#e8e4ec', 600);
    y0 += 14;
    const grey = '#857d8c', light = '#ddd6e0', ink = '#3a3340';
    for (let k = 0; k < 4; k++) {
      const T = C.tiles[k], ox = 24 + (k % 2) * (TW + 40), oy = y0 + Math.floor(k / 2) * (TH + 196);
      const X = (x) => ox + x * S, Y = (y) => oy + y * S;
      g.save(); g.beginPath(); g.rect(ox, oy, TW, TH); g.clip();
      g.fillStyle = '#f4f1f3'; g.fillRect(ox, oy, TW, TH);
      g.strokeStyle = 'rgba(120,110,130,0.12)'; g.lineWidth = 1;
      for (let x = 0; x <= 192; x += 16) { g.beginPath(); g.moveTo(X(x) + 0.5, oy); g.lineTo(X(x) + 0.5, oy + TH); g.stroke(); }
      for (let y = 0; y <= 160; y += 16) { g.beginPath(); g.moveTo(ox, Y(y) + 0.5); g.lineTo(ox + TW, Y(y) + 0.5); g.stroke(); }
      const F = SUZU_FACE[k], hx = F.cx + T.face.dx, hy = F.cy + T.face.dy, tilt = (T.face.tilt * Math.PI) / 180;
      // Suzu's face box for this tile (framing target)
      g.setLineDash([8, 6]); g.strokeStyle = '#2f8fb8'; g.lineWidth = 2; g.strokeRect(X(F.cx - 30), Y(F.cy - 33), 60 * S, 64 * S); g.setLineDash([]);
      const poly = (pts, fill, stroke, lw = 2) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
      const ell = (cx, cy, rx, ry, rot, fill, stroke, lw = 2) => { g.beginPath(); g.ellipse(X(cx), Y(cy), rx * S, ry * S, rot, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
      const line = (pts, col, lw, cap = 'round') => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = cap; g.lineJoin = 'round'; g.stroke(); };
      const rot = (dx, dy) => [hx + dx * Math.cos(tilt) - dy * Math.sin(tilt), hy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
      // hair behind the head
      const hairCol = C.colours.hair + '55';
      if (C.hair === 'spiky') {
        const pts = []; for (let a = -200; a <= 20; a += 10) { const r = a % 20 === 0 ? 46 : 34; const q = rot(Math.cos((a * Math.PI) / 180) * r, Math.sin((a * Math.PI) / 180) * r - 6); pts.push(q); }
        pts.push(rot(30, 20), rot(-30, 20)); poly(pts, hairCol, grey);
      } else if (C.hair === 'bun') {
        ell(...rot(0, -6), 36, 38, tilt, hairCol, grey); ell(...rot(2, -44), 16, 14, tilt, hairCol, grey);
        line([rot(-14, -50), rot(16, -58)], C.colours.accent === '#e8e0c8' ? '#c8a040' : C.colours.accent, 3); line([rot(-10, -42), rot(22, -52)], '#c8a040', 3); ell(...rot(18, -58), 1.6, 1.6, 0, '#d04a5a', null);
      } else if (C.hair === 'ponytail') {
        ell(...rot(0, -6), 35, 37, tilt, hairCol, grey);
        poly([rot(24, -26), rot(44, -10), rot(52, 22), rot(48, 56), rot(40, 70), rot(36, 40), rot(30, 6)], hairCol, grey);
      }
      // torso and clothing
      poly([[44, 161], [56, 140], [72, 125], [108, 114], [hx - 12, hy + 34], [hx + 18, hy + 34], [168, 116], [193, 122], [193, 161]], C.colours.cloth + '44', grey);
      if (C.extras.includes('strap')) line([[74, 124], [118, 146], [150, 161]], '#8a6a40aa', 7 * S);
      if (C.extras.includes('apron')) poly([[hx - 20, hy + 40], [hx + 24, hy + 40], [hx + 32, 161], [hx - 28, 161]], '#f2ecd8cc', grey);
      if (C.extras.includes('collar')) { poly([rot(-16, 26), rot(18, 26), rot(20, 42), rot(-18, 42)], C.colours.cloth + '88', grey); for (let i = 0; i < 4; i++) ell(hx + 4, hy + 50 + i * 10, 1.6, 1.6, 0, C.colours.accent, null); }
      poly([rot(-10, 22), rot(12, 22), rot(14, 38), rot(-10, 38)], C.colours.skin + 'aa', grey);
      if (C.extras.includes('scarf')) { poly([rot(-20, 30), rot(22, 30), rot(24, 42), rot(-22, 42)], C.colours.accent + 'cc', grey); poly([rot(12, 40), rot(22, 40), rot(30, 74), rot(20, 76)], C.colours.accent + 'bb', grey); }
      // face
      ell(hx, hy, 27, 31, tilt, C.colours.skin + 'cc', grey);
      const look = T.face.look === 'left' ? -4 : T.face.look === 'down' ? 0 : 0;
      g.setLineDash([4, 4]); line([rot(look * 0.5, -30), rot(look, 4), rot(look * 0.6, 30)], 'rgba(60,50,70,0.35)', 1.5); g.setLineDash([]);
      line([rot(-24, 4), rot(24, 4)], 'rgba(60,50,70,0.25)', 1.5);
      // eyes, brows, mouth
      const eyeY = 4, eyes = [[-12, 1.15], [12, 1]];
      for (const [ex, sc] of eyes) {
        const [cx, cy] = rot(ex, eyeY), r = 4.6 * sc, px = T.face.look === 'left' ? -2 : 0, py = T.face.look === 'down' ? 1.6 : 0;
        const E = T.eyes;
        if (E === 'narrow' || E === 'focus') { line([rot(ex - 5 * sc, eyeY - 1), rot(ex + 5 * sc, eyeY - 1.6)], ink, 3); ell(cx + px, cy + 0.6, 2, 1.6, 0, ink, null); }
        else if (E === 'down') { line([rot(ex - 5, eyeY), rot(ex, eyeY + 1.6), rot(ex + 5, eyeY)], ink, 3); }
        else if (E === 'relaxed' || E === 'soft') { line([rot(ex - 5 * sc, eyeY - 0.5), rot(ex + 5 * sc, eyeY - 1)], ink, 3); ell(cx, cy + 1.2, 2.4, 1.6, 0, ink, null); }
        else { ell(cx, cy, r * 0.8, r, tilt, '#ffffff', ink, 2); ell(cx + px, cy + 0.6 + py, 2.2, 2.8, 0, ink, null); line([rot(ex - 5 * sc, eyeY - r), rot(ex + 5 * sc, eyeY - r - 0.6)], ink, 3); }
        const bro = E === 'focus' ? 1.5 : E === 'confident' && ex > 0 ? -1.5 : E === 'open' ? -1 : 0;
        line([rot(ex - 6, eyeY - 9 + (ex < 0 ? bro : 0)), rot(ex + 6, eyeY - 10 + (ex > 0 ? bro : 0))], ink, 2.5);
      }
      if (C.glasses) { for (const [ex, sc] of eyes) ell(...rot(ex, eyeY), 7.4 * sc, 6.6 * sc, tilt, null, '#5a4a30', 2.5); line([rot(-4, eyeY - 1), rot(4, eyeY - 1)], '#5a4a30', 2.5); }
      const M = T.mouth, my = 20;
      if (M === 'set') line([rot(-5, my), rot(4, my)], ink, 2.5);
      else if (M === 'small') ell(...rot(0, my), 2.2, 2.6, 0, '#6e2a20', null);
      else if (M === 'grin') line([rot(-7, my - 0.5), rot(-1, my + 2), rot(6, my), rot(9, my - 3)], ink, 2.5);
      else if (M === 'half') line([rot(-6, my), rot(2, my + 1), rot(7, my - 2)], ink, 2.5);
      else if (M === 'soft') line([rot(-6, my - 0.6), rot(0, my + 1.2), rot(6, my - 0.6)], ink, 2.5);
      else if (M === 'firm_smile') line([rot(-6, my), rot(0, my + 1), rot(6, my - 1)], ink, 2.8);
      else if (M === 'smile_open') poly([rot(-7, my - 1), rot(7, my - 2), rot(4, my + 4), rot(-3, my + 4.4)], '#c06058', ink, 2);
      // fringe, and the pencil
      if (C.hair === 'spiky') poly([rot(-28, -12), rot(-20, -30), rot(0, -36), rot(22, -30), rot(28, -10), rot(14, -18), rot(4, -10), rot(-8, -16)], C.colours.hair + '44', grey);
      if (C.hair === 'bun') poly([rot(-28, -6), rot(-22, -28), rot(4, -34), rot(26, -24), rot(28, -6), rot(12, -16), rot(-6, -12)], C.colours.hair + '44', grey);
      if (C.hair === 'ponytail') poly([rot(-28, 0), rot(-24, -28), rot(6, -36), rot(26, -22), rot(24, -6), rot(-4, -18), rot(-14, -6)], C.colours.hair + '44', grey);
      if (C.extras.includes('pencil')) { line([rot(22, -2), rot(38, -30)], '#e0b030', 3.4 * S, 'butt'); line([rot(36, -27), rot(39, -32)], '#f0a0b0', 3.4 * S, 'butt'); }
      // arrows from the previous hand positions
      (T.from || []).forEach((fp, i) => {
        const to = (T.arms[i] || T.arms[0]).hand; const [x1, y1] = fp, [x2, y2] = to;
        const mx = (x1 + x2) / 2 + (y2 - y1) * 0.2, my2 = (y1 + y2) / 2 - (x2 - x1) * 0.2;
        g.setLineDash([10, 7]); g.beginPath(); g.moveTo(X(x1), Y(y1)); g.quadraticCurveTo(X(mx), Y(my2), X(x2), Y(y2)); g.strokeStyle = '#d0582a'; g.lineWidth = 3; g.stroke(); g.setLineDash([]);
        const a = Math.atan2(Y(y2) - Y(my2), X(x2) - X(mx)); g.beginPath(); g.moveTo(X(x2), Y(y2)); g.lineTo(X(x2) - 16 * Math.cos(a - 0.4), Y(y2) - 16 * Math.sin(a - 0.4)); g.lineTo(X(x2) - 16 * Math.cos(a + 0.4), Y(y2) - 16 * Math.sin(a + 0.4)); g.closePath(); g.fillStyle = '#d0582a'; g.fill();
        ell(x1, y1, 3, 3, 0, null, '#d0582a', 2);
      });
      // arms and hands
      for (const A of T.arms) {
        line([A.from, A.el, A.hand], C.colours.cloth + '99', 11 * S); line([A.from, A.el, A.hand], grey, 2);
        const [x, y] = A.hand, a = (A.ang * Math.PI) / 180, d = (L, aa = a) => [x + Math.cos(aa) * L, y + Math.sin(aa) * L];
        const skin = C.colours.skin;
        if (A.type === 'point') { // index and middle finger together, side by side
          ell(x, y, 6.5, 6, a, skin, ink);
          const nx = -Math.sin(a), ny = Math.cos(a);
          for (const [o, L] of [[-1.5, 17], [1.5, 15.5]]) { const p0 = [x + nx * o + Math.cos(a) * 4, y + ny * o + Math.sin(a) * 4], p1 = [x + nx * o + Math.cos(a) * L, y + ny * o + Math.sin(a) * L]; line([p0, p1], ink, 3.2 * S); line([p0, p1], skin, 2.4 * S); }
        }
        else if (A.type === 'open' || A.type === 'ward') { ell(x, y, 7.5, 8, a, skin, ink); for (let f = -2; f <= 2; f++) { const fa = a + f * 0.28, L = f === 2 || f === -2 ? 9 : 12; line([d(5, fa), d(5 + L, fa)], ink, 3 * S); line([d(5, fa), d(5 + L, fa)], skin, 2.2 * S); } }
        else if (A.type === 'cup' || A.type === 'cradle') { g.beginPath(); g.ellipse(X(x), Y(y), 10 * S, 4.5 * S, 0, 0, Math.PI); g.fillStyle = skin; g.fill(); g.strokeStyle = ink; g.lineWidth = 2; g.stroke(); }
        else if (A.type === 'over') ell(x, y, 9, 5, 0.2, skin, ink);
        else if (A.type === 'tap' || A.type === 'glasses') { ell(x, y, 6, 6, 0, skin, ink); line([d(3), d(12)], ink, 3.2 * S); line([d(3), d(12)], skin, 2.4 * S); }
        else ell(x, y, 6.2, 6.2, 0, skin, ink); // hold, strap, rest, collar: a closed hand
      }
      // props
      if (T.prop) {
        const P = T.prop, [x, y] = [P.x, P.y], a = (P.ang * Math.PI) / 180;
        g.save(); g.translate(X(x), Y(y)); g.rotate(a);
        if (P.type === 'vial') { g.fillStyle = '#9fe0dacc'; g.fillRect(-3.4 * S, -6 * S, 6.8 * S, 12 * S); g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(-3.4 * S, -6 * S, 6.8 * S, 12 * S); g.fillStyle = '#b08850'; g.fillRect(-2.4 * S, -9 * S, 4.8 * S, 3 * S); }
        if (P.type === 'lamp') {
          const gl = P.glow || 0; if (gl) { const rg = g.createRadialGradient(0, 0, 2, 0, 0, (10 + 26 * gl) * S); rg.addColorStop(0, `rgba(255,214,120,${0.55 * gl + 0.2})`); rg.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, (10 + 26 * gl) * S, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = '#d8b060'; g.fillRect(-5 * S, -6 * S, 10 * S, 13 * S); g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(-5 * S, -6 * S, 10 * S, 13 * S);
          g.fillStyle = '#fff3c0'; g.fillRect(-3 * S, -3 * S, 6 * S, 7 * S); g.beginPath(); g.arc(0, -8 * S, 3 * S, Math.PI, 0); g.stroke();
        }
        g.restore();
      }
      // effect marks (painted on a separate layer in the real art)
      for (const [x, y, kind] of T.fx || []) {
        if (kind === 'glint') { line([[x - 5, y], [x + 5, y]], '#e0a020', 2.5); line([[x, y - 6], [x, y + 6]], '#e0a020', 2.5); }
        if (kind === 'drops') for (let i = 0; i < 3; i++) ell(x - i * 5, y + i * 4, 1.6, 2.2, 0, '#7fd0e8', '#3a8aa8', 1.5);
        if (kind === 'halo') { g.setLineDash([6, 6]); ell(x, y, 30, 30, 0, null, '#e0a020', 2); g.setLineDash([]); }
      }
      g.restore();
      g.strokeStyle = '#4a4458'; g.lineWidth = 1; g.strokeRect(ox + 0.5, oy + 0.5, TW - 1, TH - 1);
      // caption
      text(`${k + 1}  ·  ${T.state}  ·  ${T.title}`, ox, oy + TH + 26, 18, '#ffffff', 700);
      let cy2 = oy + TH + 50; for (const s of T.lines) cy2 = para('•  ' + s, ox, cy2, TW, 14, '#d6d0dc', 20, '    ');
    }
    let y1 = y0 + 2 * (TH + 196) - 24;
    y1 = para('Key:  blue dashed box = where the face sits in the Suzu sheet for this tile  ·  orange arrow = the hand\'s path from the previous tile  ·  gold and cyan marks = effects (paint them, but keep them separable and off the face)', 24, y1, 1192, 13, '#bdb6c4', 19) + 14;
    text('Keep', 24, y1, 16, '#ffffff', 700);
    const keep = [
      'The finish of the Suzu sheet: crisp square pixels, painted shading, a selective dark outline, warm light from the upper left, a cool lavender rim on the outer edges.',
      'The same scale and framing as Suzu: head right of centre, bust running off the bottom edge, hair and the gesture flowing to the left.',
      `${C.name}'s identity exactly as in the game: hair, face, outfit, props and colours (above). The same person in all four tiles.`,
      'One continuous moment: from tile to tile the head stays within a few pixels, and the hand travels along the arrow.',
    ];
    y1 += 24; for (const s of keep) y1 = para('•  ' + s, 24, y1, 1192, 14, '#d6d0dc', 20, '    '); y1 += 14;
    text('Avoid', 24, y1, 16, '#ffffff', 700);
    const avoid = [
      'Any text, labels, numbers, grid lines, borders or the blue boxes and arrows from this page.',
      'A painted checkerboard or a gradient background: real transparency, or flat #FF00FF magenta if transparency is not possible.',
      'New props, jewellery, weapons or a different outfit; a hand or effect covering the face.',
      "Copying Suzu's gesture: her open-palm fling and wink are hers alone.",
    ];
    y1 += 24; for (const s of avoid) y1 = para('•  ' + s, 24, y1, 1192, 14, '#d6d0dc', 20, '    ');
    return y1 + 16;
  }, { C, ref, SUZU_FACE });
  await p.setViewportSize({ width: 1240, height: Math.ceil(h) });
  await p.screenshot({ path: `${OUT}/ref_four_tile_${id}.png`, clip: { x: 0, y: 0, width: 1240, height: Math.ceil(h) } });
  await p.close();
  console.log(id, 'page height', Math.ceil(h));
}
await b.close();
