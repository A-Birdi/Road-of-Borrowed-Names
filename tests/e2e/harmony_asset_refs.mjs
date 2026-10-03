// Reference sheets and templates for the painted Harmony busts (docs/harmony/ASSET_BRIEF.md).
// Renders what the game already knows about each character (dialogue portraits, battle figure,
// world sprite, the current code-drawn bust, the palettes) plus the canvas templates the painted
// frames must follow, into docs/harmony/asset_brief/. Not part of the default suite: an evidence
// writer like harmony_art_sheets.mjs. Every look shown is a SYNTHETIC fixture or a companion's
// authored look, never a saved campaign.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'docs/harmony/asset_brief');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const browser = await launch();
const { p, errors } = await page(browser, url, { viewport: { width: 1280, height: 800 } });

const files = await p.evaluate(() => {
  const out = {};
  const SP = RB.sprites, PO = RB.portraits, BA = RB.battlers, HA = RB.harmonyArt;
  const BG = '#2b2f3c', INK = '#e8e2d0', DIM = '#a8a294';
  const mk = (w, h, bg) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
  const text = (g, s, x, y, size, col, bold) => { g.font = (bold ? 'bold ' : '') + (size || 14) + 'px sans-serif'; g.fillStyle = col || INK; g.fillText(s, x, y); };
  const blit = (g, src, x, y, sc, sx, sy, sw, sh) => { g.imageSmoothingEnabled = false; if (sw) g.drawImage(src, sx, sy, sw, sh, x, y, sw * sc, sh * sc); else g.drawImage(src, x, y, src.width * sc, src.height * sc); };
  const swatch = (g, x, y, col, label) => { g.fillStyle = col; g.fillRect(x, y, 34, 34); g.strokeStyle = '#000'; g.strokeRect(x + 0.5, y + 0.5, 33, 33); text(g, label || col, x, y + 48, 11, DIM); };
  const save = (name, c) => { out[name] = c.toDataURL('image/png'); };
  const portrait = (draw) => { const [c] = mk(PO.S, PO.S); draw(c); return c; };
  const figure = (look, who, id) => BA.preview(look, 'ready', null, 0, { who, id });
  const sprite = (look, dir) => SP.get(look, dir, 0);
  const NOTE = 'Rendered from the game. Reference for identity and colour only: the painted bust should keep these features at far higher detail.';

  // ---- 1. one sheet per companion ------------------------------------------------------------
  const EXPR = ['neutral', 'smile', 'think', 'surprise', 'determined'].filter((e) => PO.EXPRESSIONS.includes(e));
  while (EXPR.length < 5) { const e = PO.EXPRESSIONS.find((x) => !EXPR.includes(x)); if (!e) break; EXPR.push(e); }
  for (const id of HA.COMPANIONS) {
    const ch = RB.content.chars[id], look = ch.look;
    const [c, g] = mk(1560, 1010, BG);
    text(g, ch.name.en + ' — ' + ch.role.en + ' (companion). ' + NOTE, 20, 30, 15, INK, true);
    text(g, 'Dialogue portraits (96 × 96, shown 3×)', 20, 62, 13, DIM);
    EXPR.forEach((e, i) => { const pc = portrait((cv) => PO.draw(cv, id, e)); blit(g, pc, 20 + i * 304, 72, 3); text(g, e, 20 + i * 304, 72 + 288 + 18, 12, DIM); });
    const y2 = 400;
    text(g, 'Battle figure (shown 3×)', 20, y2, 13, DIM);
    const fg = figure(look, 'comp', id); blit(g, fg, 20, y2 + 10, 3);
    text(g, 'World sprite: down / side / up (shown 6×)', 300, y2, 13, DIM);
    ['down', 'right', 'up'].forEach((d, i) => blit(g, sprite(look, d), 300 + i * 110, y2 + 10, 6));
    text(g, 'Current code-drawn Harmony bust (hold) — layout and gesture only, NOT the target fidelity (3×)', 650, y2, 13, DIM);
    const pcLook = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] };
    const cc = HA.compose({ comp: id, look: pcLook, phase: 'hold', variant: 'standard', backing: false, fx: true });
    blit(g, cc.cv, 650, y2 + 10, 3, 0, 0, 120, cc.cv.height);
    // colours
    const col = SP.colorsOf(look);
    const y3 = 790;
    text(g, 'Colours (hex). Shade freely between and beyond them, but keep these as the identity.', 20, y3, 13, DIM);
    let x = 20;
    const sw = (h, l) => { swatch(g, x, y3 + 12, h, l); x += 96; };
    sw(col.skin[0], 'skin ' + col.skin[0]); sw(col.skin[1], 'skin shd ' + col.skin[1]);
    col.hair.forEach((h, i) => sw(h, 'hair' + (i ? ' ' + i : '') + ' ' + h));
    sw(look.cloth[0], 'cloth ' + look.cloth[0]); sw(look.cloth[1], 'cloth shd ' + look.cloth[1]); sw(look.cloth[2], 'trim ' + look.cloth[2]);
    for (const k of ['scarfCol', 'ribbonCol', 'earCol', 'boots']) if (look[k]) sw(look[k], k.replace('Col', '') + ' ' + look[k]);
    text(g, 'Wears: ' + (ch.portrait.acc || look.acc || []).join(', ') + '. Cut: ' + look.shape + '.', 20, y3 + 90, 13, INK);
    save('ref_companion_' + id + '.png', c);
  }

  // ---- 2. the player's hairstyles -----------------------------------------------------------
  {
    const base = { skin: 2, hair: 'short', hairColor: 2, outfit: 0, shape: 'tunic', acc: [] };
    const cols = 6, cw = 300, chh = 330;
    const [c, g] = mk(20 + cols * cw, 70 + 2 * chh, BG);
    text(g, 'Player hairstyles (12): dialogue portrait (2.5×) and world sprite side and back (2×). One synthetic look, hair colour "brown". ' + NOTE, 20, 30, 14, INK, true);
    SP.HAIRSTYLES.forEach((h, i) => {
      const look = Object.assign({}, base, { hair: h });
      const x = 20 + (i % cols) * cw, y = 50 + Math.floor(i / cols) * chh;
      text(g, h, x, y + 14, 14, INK, true);
      blit(g, portrait((cv) => PO.drawPlayer(cv, look, 'neutral')), x, y + 22, 2.5);
      blit(g, sprite(look, 'right'), x + 248, y + 22, 2);
      blit(g, sprite(look, 'up'), x + 248, y + 80, 2);
    });
    save('ref_player_hairstyles.png', c);
  }

  // ---- 3. the player's cuts, accessories and keepsakes --------------------------------------
  {
    const items = RB.content.items, keep = Object.keys(items).filter((k) => items[k] && items[k].slot === 'cosmetic' && items[k].acc).sort();
    const base = { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: [] };
    const cuts = RB.harmonyArtFixtures.SHAPES;
    const rows = [
      { title: 'Clothing cuts (5): battle figure 2×, portrait 2×', list: cuts.map((s) => ({ label: s, look: Object.assign({}, base, { shape: s }) })) },
      { title: 'Creation accessories (8)', list: SP.ACCESSORIES.map((a) => ({ label: a, look: Object.assign({}, base, { acc: [a] }) })) },
      { title: 'Wearable keepsakes (' + keep.length + ')', list: keep.map((k) => ({ label: items[k].name.en + ' [' + items[k].acc + ']', look: RB.equip.lookWith(base, k) })) },
    ];
    const cw = 250, chh = 196, per = 7;
    const nrows = rows.reduce((n, r) => n + Math.ceil(r.list.length / per), 0);
    const [c, g] = mk(20 + per * cw, 60 + rows.length * 30 + nrows * chh, BG);
    text(g, 'Player wear. ' + NOTE, 20, 30, 14, INK, true);
    let y = 50;
    for (const r of rows) {
      text(g, r.title, 20, y + 18, 15, INK, true); y += 30;
      r.list.forEach((it, i) => {
        if (i && i % per === 0) y += chh;
        const x = 20 + (i % per) * cw;
        text(g, it.label, x, y + 14, 12, INK);
        blit(g, figure(it.look, 'pc'), x, y + 20, 1.5);
        blit(g, portrait((cv) => PO.drawPlayer(cv, it.look, 'neutral')), x + 110, y + 20, 1.4);
      });
      y += chh;
    }
    save('ref_player_wear.png', c);
  }

  // ---- 4. palettes, plus the key families the player kit is painted in (contract v3) ---------------
  {
    const HC0 = RB.harmonyContract, CC = HC0.colour;
    const [c, g] = mk(1320, 1340, BG);
    text(g, 'Game palettes the player kit is recoloured to (the game builds shaded ramps from these).', 20, 30, 15, INK, true);
    let y = 56;
    const row = (title, list, names) => {
      text(g, title, 20, y + 14, 13, INK, true); y += 22;
      list.forEach((ramp, i) => {
        const x = 20 + i * 128;
        ramp.forEach((h, k) => { g.fillStyle = h; g.fillRect(x + k * 30, y, 28, 28); });
        text(g, names ? names[i] : '#' + i, x, y + 44, 11, DIM);
        text(g, ramp[0], x, y + 58, 10, DIM);
      });
      y += 80;
    };
    row('Skin (7)', SP.SKIN);
    row('Hair colour (10)', SP.HAIR.slice(0, 9), SP.HAIR_NAMES.slice(0, 9)); row('', SP.HAIR.slice(9), SP.HAIR_NAMES.slice(9));
    row('Clothing colour (8): main, shade, trim', SP.CLOTH);
    y += 16;
    const I = HC0.IMPORT, E = I.extend;
    text(g, 'KEY FAMILIES (contract v' + HC0.VERSION + ') — paint the PLAYER KIT in these families, with as many values as the drawing needs (6–12 recommended).', 20, y + 14, 15, '#f0c878', true); y += 22;
    text(g, 'Each band runs darkest → lightest, a little beyond both ends (' + E + ' steps). The five ▲ anchors are the exact key shades (contract v2\'s): useful, never required.', 20, y + 14, 13, INK); y += 18;
    text(g, 'Rows: the band itself (middle) and how far a value may lean in hue or chroma and still belong to the family — up to about 12° of hue and 16 % of chroma in total', 20, y + 14, 13, INK); y += 18;
    text(g, '(rim lights and warm highlights included). Further out the importer stops: unresolved, then fixed (it keeps its colour in every look). Not a palette to pick from: any value on the band is fine.', 20, y + 14, 13, INK); y += 26;
    const keys = [['skin (key)', 'skin'], ['hair', 'hair'], ['cloth main', 'clothMain'], ['cloth trim', 'clothTrim'], ['accessory', 'accessory']];
    const X0 = 170, BW = 1100, STEPS = 88, cw = BW / STEPS;
    const tAt = (k) => -E + ((4 + 2 * E) * (k + 0.5)) / STEPS;
    const xOfT = (t) => X0 + ((t + E) / (4 + 2 * E)) * BW;
    const VAR = [[0, -12], [-0.16, 0], [0, 0], [0.16, 0], [0, 12]];
    for (const [name, m] of keys) {
      text(g, name, 20, y + 34, 13, INK, true);
      const K = CC.keyCurve(m);
      VAR.forEach(([rho, deg], ri) => {
        const hgt = ri === 2 ? 30 : 11, yy = y + (ri < 2 ? ri * 12 : ri === 2 ? 24 : 54 + (ri - 3) * 12);
        for (let k = 0; k < STEPS; k++) {
          const q = CC.curveAt(K, tAt(k)), ch = Math.hypot(q[1], q[2]) * (1 + rho), h = Math.atan2(q[2], q[1]) + (deg * Math.PI) / 180;
          const rgb = CC.srgbOf(q[0], ch * Math.cos(h), ch * Math.sin(h));
          g.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
          g.fillRect(Math.floor(X0 + k * cw), yy, Math.ceil(cw), hgt);
        }
      });
      text(g, '−12° hue', X0 - 66, y + 10, 10, DIM); text(g, '−16 % chroma', X0 - 84, y + 21, 10, DIM); text(g, '+16 % chroma', X0 - 84, y + 64, 10, DIM); text(g, '+12° hue', X0 - 66, y + 76, 10, DIM);
      // the anchors (exact key shades), marked under the band with their hex
      HC0.KEY_RAMPS[m].forEach((hx, sh) => {
        const x = xOfT(sh);
        g.fillStyle = INK; g.beginPath(); g.moveTo(x, y + 80); g.lineTo(x - 6, y + 90); g.lineTo(x + 6, y + 90); g.closePath(); g.fill();
        g.strokeStyle = '#000'; g.lineWidth = 1; g.strokeRect(Math.round(x) - 0.5, y + 23.5, 1, 31);
        text(g, 's' + sh + ' ' + hx, x - 30, y + 104, 11, DIM);
      });
      // the ends of the key ramp (s0, s4) and the band's extension past them
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(Math.round(xOfT(0)) - 1, y - 2, 1, 4); g.fillRect(Math.round(xOfT(4)), y - 2, 1, 4);
      y += 118;
    }
    text(g, 'Outline ink #140c18, whites, eyes, brush, metal, glass and leather are painted in their final colours and never recoloured. Keep them clearly away from these families', 20, y + 14, 13, INK);
    text(g, '(the synthetic sample\'s brown iris, 38 % less saturated than the skin family at its value, is the closest fixed colour it has: it stays fixed). Companions are never recoloured.', 20, y + 32, 13, INK);
    save('ref_palettes.png', c);
  }

  // ---- 5. templates ---------------------------------------------------------------------------
  // geometry (art px) from the contract itself (RB.harmonyContract, docs/harmony/contract/CONTRACT.md §3): the
  // companion turned to screen right, the player to screen left, each with its own anchors
  const HC = RB.harmonyContract;
  const T = { bust: HC.BUST, pair: HC.PAIR.standard, pcAt: HC.PAIR.standard.pc[0], compact: HC.COMPACT_SAFE };
  const guides = (g, sc, ox, oy, who, labels) => {
    const A = HC.ANCHORS[who === 'pc' ? 'pc' : 'comp'];
    const R = (b, col, dash, label) => { g.setLineDash(dash || []); g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(ox + b[0] * sc + 1, oy + b[1] * sc + 1, (b[2] - b[0]) * sc - 2, (b[3] - b[1]) * sc - 2); g.setLineDash([]); if (labels && label) text(g, label, ox + b[0] * sc + 4, oy + b[1] * sc + 16, 12, col); };
    g.strokeStyle = '#888'; g.lineWidth = 2; g.strokeRect(ox + 1, oy + 1, T.bust.w * sc - 2, T.bust.h * sc - 2);
    R(A.head, '#5ab0ff', [8, 6], 'head: crown to chin (hair may spill past)');
    R(A.face, '#ffd84a', null, 'face: brow to chin');
    R(T.compact, '#b0b0b0', [3, 5], labels ? 'compact-safe' : null);
    A.hands.forEach((h, i) => R(h, '#ff7ad0', [12, 4], i ? 'or forward' : 'signature hand'));
    const [nx, ny] = A.neck; g.strokeStyle = '#ff4a4a'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(ox + (nx - 4) * sc, oy + ny * sc); g.lineTo(ox + (nx + 4) * sc, oy + ny * sc); g.moveTo(ox + nx * sc, oy + (ny - 4) * sc); g.lineTo(ox + nx * sc, oy + (ny + 4) * sc); g.stroke();
    if (labels) text(g, 'neck pit', ox + (nx + 5) * sc, oy + ny * sc + 4, 12, '#ff4a4a');
    g.strokeStyle = '#3ad0a0'; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(ox + A.crop[0][0] * sc, oy + A.crop[0][1] * sc); g.lineTo(ox + A.crop[1][0] * sc, oy + A.crop[1][1] * sc); g.stroke(); g.setLineDash([]);
    if (labels) text(g, 'ink band edge (paint past it to the bottom)', ox + 8, oy + A.crop[0][1] * sc - 6, 12, '#3ad0a0');
    // facing marker: an arrow at the top, pointing the way the figure turns (companion right, player left)
    const ay = oy + 10, dir = who === 'pc' ? -1 : 1, mx = ox + T.bust.w * sc / 2;
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx - dir * 14, ay); g.lineTo(mx + dir * 14, ay); g.moveTo(mx + dir * 14, ay); g.lineTo(mx + dir * 6, ay - 6); g.moveTo(mx + dir * 14, ay); g.lineTo(mx + dir * 6, ay + 6); g.stroke();
  };
  // the image tool's base: guides only, transparent, 4× (768 × 640), one per side
  for (const who of ['comp', 'pc']) {
    const [c, g] = mk(T.bust.w * 4, T.bust.h * 4);
    guides(g, 4, 0, 0, who, false);
    save('template_bust_' + who + '_4x.png', c);
  }
  // the labelled version for people
  {
    const sc = 3, [c, g] = mk(40 + 2 * (T.bust.w * sc + 40), 120 + T.bust.h * sc, BG);
    text(g, 'Bust canvas 192 × 160 art px (shown 3×), contract v' + HC.VERSION + '. Companion three-quarter to screen RIGHT; player three-quarter to screen LEFT. Light from the upper left.', 20, 30, 15, INK, true);
    text(g, 'Left: a companion (neck pit 94, 118; signature hand on the near side, or forward up to x 190). Right: the player (neck pit 98, 118; brush hand on the near side, screen right).', 20, 54, 13, DIM);
    guides(g, sc, 20, 80, 'comp', true); text(g, 'companion', 20, 80 + T.bust.h * sc + 22, 13, INK);
    guides(g, sc, 60 + T.bust.w * sc, 80, 'pc', true); text(g, 'player', 60 + T.bust.w * sc, 80 + T.bust.h * sc + 22, 13, INK);
    save('template_bust_labelled.png', c);
  }
  {
    const sc = 2, [c, g] = mk(40 + T.pair.w * sc, 140 + T.pair.h * sc, BG);
    text(g, 'The pair: 352 × 160 art px (2×). Companion at x 0, player at x 160 in front; facing each other.', 20, 30, 15, INK, true);
    text(g, 'The game draws the ink band behind them. Phones show a compact crop with the player 24 px closer.', 20, 54, 13, DIM);
    guides(g, sc, 20, 80, 'comp', false); guides(g, sc, 20 + T.pcAt * sc, 80, 'pc', false);
    g.strokeStyle = '#fff'; g.lineWidth = 1; g.strokeRect(20.5, 80.5, T.pair.w * sc - 1, T.pair.h * sc - 1);
    save('template_pair_labelled.png', c);
  }
  return { out, T, keep: Object.keys(RB.content.items).filter((k) => RB.content.items[k].slot === 'cosmetic').length };
});

for (const [name, data] of Object.entries(files.out)) fs.writeFileSync(path.join(OUT, name), Buffer.from(data.split(',')[1], 'base64'));
console.log('wrote', Object.keys(files.out).length, 'files to docs/harmony/asset_brief/', '— keepsakes:', files.keep);
if (errors.length) { console.log('page errors:\n' + errors.join('\n')); process.exitCode = 1; }
await browser.close(); srv.close();
