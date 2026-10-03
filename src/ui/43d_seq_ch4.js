/* Chapter 4's illustrated sequences (docs/expressive/SHOTS.md §4 and §7b).
 *
 * ch4.lamp — the lamp's name holds (`sb.lamp_name`, src/content/ch4/34_scenes_end.js), from the moment the name
 * challenge succeeds. The lamp room of the observatory (map `sb.obs_dome`): the great lamp, a tall paper shade in
 * a lacquered frame on its pillar; a telescope; the dome's open slit and the night beyond. The room is cold blue
 * until the flame turns, then the lamp warms it. Compositions:
 *   akari  close on the shade: the name you have just written stays (a drop of ink starts to run and stops);
 *          the bodiless voice swells the blue flame; on the line that says so the flame turns yellow, then orange
 *   ask    Hoshino by the lamp, the telescope behind him; you and your companion with your backs to us: he looks
 *          from the lamp to you (the choice is answered over this)
 *   stay | go | both   closer on Hoshino, one for each answer: his hand settles on the lamp's frame; or the
 *          surprise, then he turns to the dome's window and the valley; or one hand on the lamp and the other
 *          toward the window. Your companion's own small gesture on their aside
 *   flint  the insert: his old flint struck over the wick, the spark, your word held to it, the flame rising
 *   valley outside: the dome at night, its light pouring out across the snowy valley toward Lanternfall
 * ch4.reply — the reply letter (`sb.lamp_reply`), after its challenge: the envelope sealed and turned to show the
 * address left blank; then Hoshino holds it out and your hand takes it (on the line that gives it to you).
 * ch4.inn — the faded passage `sb.next_day_inn`: one shot, the upstairs window at Yukimiya at night, the lamp lit on
 * the mountain; the candle on the sill is put out and the mountain's light stays.
 * ch4.morning — `sb.quiet_morning`: the night's end stays black, as written; one quiet shot as the light returns:
 * the same window in the morning after the storm, the world white under a cloudless sky (the lamp on the mountain
 * still dark: it is lit only later).
 * People are the game's own drawings (portraits, road sprites), graded into the light. No letters, kana or kanji
 * are drawn: the name on the shade and the letter are brush marks and ruled lines, never characters. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const step4 = (a) => Math.round(clamp(a, 0, 1) * 4) / 4;
  const q20 = (v) => Math.round(clamp(v, 0.2, 1) * 20) / 20;
  const fig = (lk, dir, key, sc, g) => (lk ? Q.figure(lk, dir, key || 'i0', q20(sc), g) : null);
  const put = (c, f, x, y) => { if (f) c.drawImage(f.cv, Math.round(x - f.ax), Math.round(y - f.ay)); };
  const skin = (id) => Q.skinOf(look(id));
  const sleeve = (id) => (look(id).cloth || ['#555'])[0];
  const pcSkin = (st) => Q.skinOf(st.cast.pc || {}), pcSleeve = (st) => Q.clothOf(st.cast.pc || {})[0];

  // ---- light ----------------------------------------------------------------------------------------------
  // the lamp room: moonlight from the slit (cool, on our left), and the lamp (warm, w 0..1) once its flame turns
  const COLD = { mul: [0.74, 0.8, 0.96], add: [4, 8, 22], rim: { side: 'l', col: '#b8d0f0', k: [0.4, 0.16], below: 0.85 } };
  const WARM = { mul: [0.92, 0.84, 0.78], add: [12, 4, 0], rim: { side: 'r', col: '#ffc070', k: [0.42, 0.18], below: 0.85 } };
  const WARM_L = { mul: [0.92, 0.84, 0.78], add: [12, 4, 0], rim: { side: 'l', col: '#ffc070', k: [0.42, 0.18], below: 0.85 } };
  const BACKLIT = { mul: [0.62, 0.58, 0.66], add: [10, 6, 12], rim: { side: 't', col: '#ffc070', k: [0.4, 0.16] } };
  // the flame's colour as it turns: blue → yellow → orange (u 0..1)
  function flameCols(u) {
    const blue = [['#3a5ad8', '#7aa0ff', '#d8e8ff'], ['#c8b030', '#ffe060', '#fffad8'], ['#e06818', '#ffa040', '#fff0b8']];
    const i = u < 0.5 ? 0 : 1, f = u < 0.5 ? u * 2 : (u - 0.5) * 2;
    const a = blue[i], b = blue[i + 1];
    return f < 0.5 ? a : b;
  }
  const glowRGB = (u) => (u < 0.25 ? '150,190,255' : u < 0.75 ? '255,226,140' : '255,180,100');
  // a flame: a teardrop of three tones, flickering a little (still: no flicker)
  function flame(c, x, y, hh, u, t, still, k) {
    const cols = flameCols(u), fl = still ? 0 : Math.sin(t / 130) * 0.08 + Math.sin(t / 53) * 0.05;
    const H = Math.max(3, Math.round(hh * (1 + fl))), W = Math.max(2, Math.round(hh * 0.42));
    for (let j = 0; j < 3; j++) {
      const hj = Math.round(H * (1 - j * 0.28)), wj = Math.max(1, Math.round(W * (1 - j * 0.33)));
      c.fillStyle = cols[j];
      for (let yy = 0; yy < hj; yy++) { const f = yy / hj, ww = Math.max(1, Math.round(wj * Math.sin(Math.PI * Math.pow(f, 0.7)) * (f < 0.15 ? 0.6 : 1))); c.fillRect(Math.round(x - ww / 2), Math.round(y - yy), ww, 1); }
    }
    void k;
  }

  // ---- the lamp room ----------------------------------------------------------------------------------------
  // the dome's inside: ribs rising and curving over, iron plates between them, the open slit with the night and
  // the mountains' snow beyond; a wooden floor. Cold (moonlit); warmth is laid over it per frame.
  function domeStatic(G, key, o) {
    return cached('ch4.dome|' + key + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(o.seed || 909);
      const floor = Math.round(o.floor), sx0 = Math.round(o.slit[0]), sx1 = Math.round(o.slit[1]);
      // the night through the slit: stars, the snowy peaks low in it
      Q.bandsIn(g, sx0, 0, sx1 - sx0, floor, ['#0a1024', '#101a36', '#18264a', '#22325a'], 0.45);
      for (let i = 0; i < 40; i++) R(g, sx0 + Math.round(rnd() * (sx1 - sx0)), Math.round(rnd() * floor * 0.7), 1, 1, i % 6 ? 'rgba(220,230,255,0.75)' : '#fff8e0');
      const L = p.layer(w, h);
      const pk = p.mat('#c8d8ec', { n: 5, at: 3, step: 0.08 });
      L.fill(sx0, 0, sx1, floor, (x, y) => y > floor - s(40) + Math.abs(Math.sin(x / s(23))) * s(26), pk, (x, y) => (Math.sin(x / s(23)) > 0 ? 0.8 : 0.45));
      // the dome's inside: boarded courses curving round us (they bow down toward the sides), ribs rising from
      // the low wall and bending in toward the crown above the frame; erased where the slit is open
      const plate = p.mat('#3e4658', { n: 6, at: 3, step: 0.07 }), rib = p.mat('#5a5040', { n: 5, at: 2, step: 0.08 });
      const ax = Math.round(w * (o.apex != null ? o.apex : 0.5)), ring = Math.round(floor - s(26));
      const course = (x, i) => Math.round(ring - i * s(24) + Math.pow((x - ax) / w, 2) * s(70) * (1 + i * 0.25));
      L.rect(0, 0, w, floor, plate, (x, y) => {
        let k = 0;
        for (let i = 0; i < 12; i++) { const yy = course(x, i); if (Math.abs(y - yy) < 1) { k = 0.22; break; } if (Math.abs(y - yy - 1) < 1) { k = -0.14; break; } }
        return clamp(0.4 - Math.abs(x - ax) / w * 0.32 + k + (((x * 3 + y * 5) % 23) === 0 ? 0.05 : 0), 0, 0.999);
      });
      for (let i = -4; i <= 4; i++) {
        const bx = ax + i * s(112), pts = [];
        for (let j = 0; j <= 24; j++) { const t = j / 24, yy = lerp(floor, -h * 0.6, t), xx = lerp(bx, ax + i * s(12), t * t); pts.push([xx, yy]); }
        L.path(pts, Math.max(3, s(7)), rib, (xx) => (xx < ax ? 0.62 : 0.42));
      }
      L.rect(0, ring, w, s(6), rib, (x, y) => (y < ring + 1 ? 0.75 : 0.3));                 // the ring the dome turns on
      L.rect(0, ring + s(6), w, floor - ring - s(6), p.mat('#4a4038', { n: 5, at: 2 }), (x) => ((Math.round(x) % s(14)) < 1 ? 0.15 : 0.45)); // the low wall
      L.erase(sx0, 0, sx1, floor, () => true);
      // the slit's edges: a thick frame of the shutter's rails, icicles melting on the lintel
      L.rect(sx0 - s(8), 0, s(8), floor, rib, (x) => (x < sx0 - s(5) ? 0.4 : 0.75));
      L.rect(sx1, 0, s(8), floor, rib, (x) => (x < sx1 + s(3) ? 0.6 : 0.3));
      const ice = p.mat('#d8ecfc', { n: 4, at: 2 });
      for (let i = 0; i < 6; i++) { const x = sx0 + Math.round((i + 0.5) * (sx1 - sx0) / 6), hh = s(3) + ((i * 7) % 4) * s(2); L.poly([[x - s(2), Math.round(floor * 0.3) + s(5)], [x + s(2), Math.round(floor * 0.3) + s(5)], [x, Math.round(floor * 0.3) + s(5) + hh]], ice, 0.7); }
      // the floor: boards running toward us
      const fl = p.mat('#4a3a30', { n: 6, at: 3, step: 0.07 });
      L.rect(0, floor, w, h - floor, fl, (x, y) => { const d = y - floor, gap = Math.max(2, Math.round(2 + d * 0.1)); return (d % gap) === 0 ? 0.2 : clamp(0.45 + ((Math.round(x / (gap * 8)) + Math.floor(d / gap)) % 3) * 0.05, 0, 0.999); });
      L.rect(0, floor, w, s(3), rib, 0.3);
      if (o.scope) telescope(L, o.scope[0], o.scope[1], o.scope[2], s);
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // moonlight through the slit onto the floor
      g.fillStyle = 'rgba(170,200,255,0.08)';
      g.beginPath(); g.moveTo(sx0, floor); g.lineTo(sx1, floor); g.lineTo(sx1 + s(60), h); g.lineTo(sx0 - s(20), h); g.fill();
      return { cv };
    });
  }
  // the brass telescope on its wooden stand, angled up toward the slit
  function telescope(L, x, y, k, s) {
    const p = P(), brass = p.mat('#a88a4a', { n: 6, at: 3, step: 0.09 }), wood = p.mat('#5a4030', { n: 5, at: 2 });
    for (const dx of [-1, 1]) L.seg(x, y - s(30) * k, x + dx * s(22) * k, y, Math.max(2, s(3) * k), wood, dx < 0 ? 0.7 : 0.4);
    L.seg(x, y - s(30) * k, x, y, Math.max(2, s(3) * k), wood, 0.5);
    L.save(); L.translate(x, y - s(34) * k); L.rotate(-0.62);
    L.rect(-s(40) * k, -s(6) * k, s(90) * k, s(12) * k, brass, p.cyl(0, s(6) * k));
    L.rect(s(46) * k, -s(8) * k, s(8) * k, s(16) * k, brass, 0.7);
    L.rect(-s(10) * k, -s(7) * k, s(4) * k, s(14) * k, brass, 0.3);
    L.restore();
  }
  // warmth over the cold room: a stepped pool of lamplight round (x, y), radius r, strength w (0..1)
  function warmth(c, x, y, r, wv, t, still) {
    if (wv <= 0) return;
    const fl = still ? 1 : 0.94 + 0.06 * Math.sin(t / 170);
    c.globalAlpha = clamp(wv, 0, 1) * fl;
    P().halo(c, x, y, Math.min(r, 260), '255,170,90', 0.24, 3);
    c.globalAlpha = 1;
  }

  // the great lamp: a lacquered base and pillar, a tall paper shade in its frame, a dark cap; the name in a column
  // of brush marks on the front panel; the flame seen through the paper (and over the top). k: its scale
  function lampGeom(x, y, k) {
    const W = Math.round(40 * k), H = Math.round(54 * k);
    return { x, y, k, W, H, x0: Math.round(x - W / 2), y0: Math.round(y - H), fx: x, fy: Math.round(y - H * 0.28) };
  }
  function lamp(c, Lg, o) {
    const { x, y, k, W, H, x0, y0 } = Lg, u = o.u || 0, lit = o.lit || 0;
    const key = 'ch4.lamp|' + k + '|' + (o.frame ? 1 : 0);
    const frame = Q.small(key, () => {
      const p = P(), cw = W + Math.round(30 * k), chh = H + Math.round(96 * k), L = p.layer(cw, chh), ox = Math.round(cw / 2), oy = Math.round(chh - 70 * k);
      const lac = p.mat('#2e2834', { n: 5, at: 2, step: 0.09 }), wood = p.mat('#5a4030', { n: 5, at: 2, step: 0.08 });
      // the pillar and base below the shade, the cap above
      L.rect(ox - Math.round(6 * k), oy, Math.round(12 * k), Math.round(52 * k), lac, p.cyl(ox - 2, Math.round(6 * k)));
      L.rect(ox - Math.round(22 * k), oy + Math.round(52 * k), Math.round(44 * k), Math.round(12 * k), lac, (xx, yy) => (yy < oy + 52 * k + 2 ? 0.8 : 0.35));
      L.rect(ox - W / 2 - Math.round(4 * k), oy - H - Math.round(8 * k), W + Math.round(8 * k), Math.round(7 * k), lac, (xx, yy) => (yy < oy - H - 7 * k ? 0.8 : 0.4));
      L.rect(ox - W / 2 - Math.round(2 * k), oy - Math.round(2 * k), W + Math.round(4 * k), Math.round(5 * k), lac, 0.5);
      // the shade's frame: corner posts and a middle rail (the paper itself is drawn live, it glows)
      for (const fx of [ox - W / 2 - Math.round(2 * k), ox + W / 2 - Math.round(1 * k)]) L.rect(fx, oy - H - Math.round(2 * k), Math.max(2, Math.round(3 * k)), H + Math.round(2 * k), wood, (xx) => (xx < fx + 1 ? 0.8 : 0.4));
      L.outline();
      return { cv: L.canvas(), ox, oy };
    });
    // the paper: lit from inside, blue-white while the flame is blue, warm as it turns
    const warm = clamp(u, 0, 1), bright = 0.55 + 0.45 * lit;
    const pc = warm < 0.25 ? [200, 220, 245] : warm < 0.75 ? [250, 236, 190] : [252, 220, 160];
    for (let yy = 0; yy < H; yy++) {
      const f = 1 - Math.abs((yy - H * 0.62) / H) * 0.6;
      c.fillStyle = 'rgb(' + pc.map((v) => Math.round(v * (0.62 + 0.38 * f * bright))).join(',') + ')';
      c.fillRect(x0, y0 + yy, W, 1);
    }
    // the flame's silhouette through the paper (a brighter teardrop), and the rib lines of the paper
    c.fillStyle = 'rgba(255,255,240,' + (0.25 + 0.3 * lit).toFixed(2) + ')';
    P().disc(c, Lg.fx, Lg.fy - Math.round(4 * k), Math.max(2, Math.round(5 * k * (0.6 + lit * 0.6))), Math.max(3, Math.round(9 * k * (0.6 + lit * 0.6))));
    for (let yy = y0 + Math.round(6 * k); yy < y0 + H; yy += Math.max(3, Math.round(6 * k))) R(c, x0, yy, W, 1, 'rgba(120,110,100,0.18)');
    c.drawImage(frame.cv, Math.round(x - frame.ox), Math.round(y - frame.oy));
    // the name on the front panel: a column of brush marks (o.name: 0..1 how much is there; o.set: dry and held)
    if (o.name > 0) nameMarks(c, x0 + Math.round(W * 0.42), y0 + Math.round(H * 0.12), Math.round(H * 0.62), k, o.name, o.drip || 0);
    return Lg;
  }
  // the name you wrote: a column of brush marks down the panel. Only weight and rhythm: rounded dabs and short
  // slanted strokes, one below another, never crossing (nothing that could read as a character)
  function nameMarks(c, x, y0, len, k, f, drip) {
    const marks = [[0, 0.0, 0.16, 2.2, 0.35], [1, 0.22, 0.1, 1.8, -0.5], [0, 0.38, 0.06, 2.6, 0], [-1, 0.5, 0.14, 1.8, 0.45], [0, 0.72, 0.18, 2.4, -0.2]];
    const n = Math.ceil(marks.length * clamp(f, 0, 1));
    c.fillStyle = '#1e1418';
    for (let i = 0; i < n; i++) {
      const [dx, a, l, wd, sl] = marks[i], ww = Math.max(1, Math.round(wd * k * 0.8)), hh = Math.max(2, Math.round(l * len));
      for (let yy = 0; yy < hh; yy++) { const t = yy / hh, wv = Math.max(1, Math.round(ww * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, t * 1.3))))); c.fillRect(Math.round(x + dx * k + sl * yy - wv / 2), Math.round(y0 + a * len + yy), wv, 1); }
    }
    // a drop that starts to run from the last mark and stops (the ink holds)
    if (drip > 0) { c.fillStyle = '#2a1e22'; c.fillRect(Math.round(x - 0.2 * len * 0.18), Math.round(y0 + 0.9 * len), Math.max(1, Math.round(k)), Math.max(1, Math.round(drip * 3 * k))); }
  }

  // ==== ch4.lamp · akari: close on the shade ===================================================================
  function geomAkari(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    // the whole lamp head (the flame over the cap, the cap, the shade: about 76 k tall) fits above the sheet
    const k = clamp(Math.min((vb - s(12)) / 80, w / 130), 0.5, 3.2);
    const y0 = Math.round(22 * k + s(4));
    return Object.assign(S, { k, Lg: lampGeom(Math.round(w * (lay === 'narrow' ? 0.5 : 0.46)), y0 + Math.round(54 * k), k) });
  }
  const akari = {
    phases: [['ink', 900], ['voice', 700], ['warm', 1500]],
    safe: { wide: 'the shade central above the sheet', narrow: 'the shade in the top half', land: 'the shade and its name' },
    draw(c, w, h, t, st) {
      const G = geomAkari(w, h, st.vb), { s, k, Lg } = G, still = st.still;
      c.drawImage(domeStatic(G, 'akari', { floor: Math.round(Lg.y + 10 * k), slit: [w * 0.06, w * 0.06 + Math.max(s(40), w * 0.12)], seed: 11 }).cv, 0, 0);
      const ki = st.at('ink'), kv = st.at('voice'), kw = st.at('warm');
      // the room warms as the flame turns
      warmth(c, Lg.fx, Lg.fy, Math.round(Lg.H * 2.4), ease(kw) * 0.9, t, still);
      if (kw < 1) { c.globalAlpha = 1 - ease(kw); P().halo(c, Lg.fx, Lg.fy, Math.round(70 * k), '140,180,255', 0.2 + (kv > 0 && kv < 1 ? 0.12 * Math.sin(Math.PI * kv) : 0), 3); c.globalAlpha = 1; }
      lamp(c, Lg, { u: ease(kw), lit: 0.4 + 0.3 * Math.sin(Math.PI * kv) * (kw > 0 ? 0 : 1) + 0.3 * ease(kw), name: 1, drip: ki < 1 ? Math.min(1, ki * 1.6) * (ki < 0.6 ? 1 : 1) : 1 });
      // the flame over the top of the shade (its tip shows above the cap's opening)
      flame(c, Lg.fx, Lg.y0 - Math.round(9 * k), Math.round((6 + 3 * Math.sin(Math.PI * kv) + 3 * ease(kw)) * k), ease(kw), t, still, k);
      // your hand with the brush, drawing back from the paper at the edge of the frame
      const back = ease(ki);
      const hx = Lg.x0 + Lg.W + Math.round(lerp(4, 22, back) * k), hy = Lg.y0 + Math.round(lerp(0.92, 1.1, back) * Lg.H);
      const hd = Q.hand({ size: Math.round(6 * k), pose: 'pinch', side: 'L', angle: Math.PI - 0.5, skin: pcSkin(st), sleeve: pcSleeve(st) });
      if (hd) {
        R(c, hx - Math.round(2 * k), hy - Math.round(14 * k), Math.max(1, Math.round(1.6 * k)), Math.round(14 * k), '#8a6a44');
        R(c, hx - Math.round(2 * k), hy - Math.round(16 * k), Math.max(1, Math.round(1.6 * k)), Math.round(3 * k), '#1e1418');
        c.drawImage(hd.cv, Math.round(hx + 4 * k - hd.ax), Math.round(hy - 6 * k - hd.ay));
      }
    },
    focus(w, h, vb) { const G = geomAkari(w, h, vb), L = G.Lg; return { x: L.x0 - 4, y: L.y0 - Math.round(16 * G.k), w: L.W + 8, h: Math.min(vb - 2, L.y) - (L.y0 - Math.round(16 * G.k)) }; },
  };

  // ==== ch4.lamp · ask: Hoshino by the lamp, you and your companion before him =================================
  function geomAsk(w, h, vb, close) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow';
    // (an upright phone: he stands higher in the frame, the lamp beside him; in the wider shot you two are below
    // him, nearer)
    const hx = Math.round(w * (narrow ? 0.48 : close ? 0.44 : 0.5)), hy = narrow ? Math.round(vb - s(close ? 110 : 130)) : Math.max(Math.round(vb + s(close ? 6 : 10)), 98);
    const lk = clamp(S.Z * (close ? 1.25 : 0.9), 0.6, 1.4);
    const lampX = Math.round(hx + (narrow ? s(110) : s(close ? 120 : 132))), lampY = Math.round(Math.min(vb + s(30), hy + s(20)));
    return Object.assign(S, { hx, hy, lk, Lg: lampGeom(lampX, lampY, lk), floor: Math.round(hy - 96 * 0.15), narrow, close: !!close });
  }
  const COMP_ASIDE = { nao: 'p:strap', mio: 'p:palm', ren: 'p:clasp', suzu: 'p:size_out' };
  function hoshinoBust(c, G, expr, fr, warmL) {
    const b = Q.bust('hoshino', expr, fr, warmL ? WARM_L : WARM, false, 200);
    if (b) c.drawImage(b.cv, G.hx - b.ax, G.hy - b.ay);
    return b;
  }
  function roomWithLamp(c, G, st, t, key, o) {
    const { s } = G, still = st.still;
    c.drawImage(domeStatic(G, key, { floor: G.floor, slit: o.slit, scope: o.scope, seed: o.seed }).cv, 0, 0);
    const lit = o.lit != null ? o.lit : 0.55;
    warmth(c, G.Lg.fx, G.Lg.fy, Math.round(Math.max(G.w, G.h) * (0.4 + lit * 0.3)), 0.55 + lit * 0.35, t, still);
    lamp(c, G.Lg, { u: 1, lit, name: 1 });
    flame(c, G.Lg.fx, G.Lg.y0 - Math.round(9 * G.Lg.k), Math.round((5 + lit * 6) * G.Lg.k), 1, t, still);
    void s;
  }
  const ask = {
    phases: [['ask', 0], ['look', 900]],
    safe: { wide: 'Hoshino\'s face and the lamp in the top 55 %', narrow: 'his face in the upper half', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomAsk(w, h, st.vb, false), { s } = G;
      roomWithLamp(c, G, st, t, 'ask', { slit: [w * 0.62, w * 0.62 + Math.max(s(36), w * 0.1)], scope: [Math.round(w * 0.22), G.floor, 0.9], seed: 21, lit: 0.45 });
      const kl = st.at('look');
      // he looks from the lamp (his left, our right) to you (our lower left), thinking
      const fr = kl > 0.5 ? { look: [-1, 1], head: [-1, 0] } : kl > 0 ? { look: [0, 0] } : { look: [1, 0], head: [1, 0] };
      hoshinoBust(c, G, kl > 0.5 ? 'think2' : 'neutral', fr);
      // you and your companion before him, from behind, at the lower left
      const W = Math.round(clamp(s(118), 80, 160));
      const pb = Q.back(st.cast.pc || {}, W, { light: 'r' });
      const comp = st.cast.comp, cb = comp ? Q.back(comp.look, Math.round(W * 0.92), { light: 'r' }) : null;
      const bx = Math.round(G.narrow ? w * 0.26 : w * 0.16), by = Math.round(G.vb + s(G.narrow ? 90 : 80));
      if (cb) c.drawImage(cb.cv, Math.round(bx + W * 0.85 - cb.ax), Math.round(by + s(10) - cb.ay));
      if (pb) c.drawImage(pb.cv, bx - pb.ax, by - pb.ay);
    },
    focus(w, h, vb) { const G = geomAsk(w, h, vb, false); return { x: G.hx - 34, y: G.hy - 92, w: 68, h: 60 }; },
  };
  // the companion at the frame's edge with their own small gesture (a road figure, further back)
  function compAside(c, G, st, k, side) {
    const comp = st.cast.comp;
    if (!comp) return;
    const sc = clamp(G.Z * 0.95, 0.5, 1), x = side < 0 ? Math.round(G.s(34)) : Math.round(G.w - G.s(34)), y = Math.round(G.vb + G.s(26));
    put(c, fig(comp.look, side < 0 ? 'right' : 'left', k > 0.2 ? COMP_ASIDE[comp.id] || 'p:nod1' : 'i0', sc, WARM), x, y);
  }

  // ==== ch4.lamp · stay / go / both: closer on Hoshino ===========================================================
  const stay = {
    phases: [['hand', 700], ['settle', 900], ['comp', 900]],
    safe: { wide: 'Hoshino\'s face and his hand on the lamp in the top 55 %', narrow: 'his face in the upper half', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomAsk(w, h, st.vb, true), { s, Lg } = G;
      roomWithLamp(c, G, st, t, 'close', { slit: [w * 0.02, w * 0.02 + Math.max(s(30), w * 0.08)], seed: 31, lit: 0.45 });
      const kh = st.at('hand'), ks = st.at('settle');
      hoshinoBust(c, G, ks > 0.4 ? 'smile' : 'think2', ks > 0.4 ? { body: [0, 1] } : { look: [1, 0], head: [1, 0] });
      // his hand comes to rest on the lamp's frame
      const e = ease(kh);
      const hd = Q.hand({ size: 13, pose: 'rest', side: 'R', angle: lerp(0.9, 0.15, e), skin: skin('hoshino'), sleeve: sleeve('hoshino') });
      if (hd) c.drawImage(hd.cv, Math.round(lerp(G.hx + s(40), Lg.x0 - s(10), e) - hd.ax), Math.round(lerp(G.vb + s(20), Lg.y0 + Lg.H * 0.5, e) - hd.ay));
      compAside(c, G, st, st.at('comp'), -1);
    },
    focus(w, h, vb) { const G = geomAsk(w, h, vb, true); return { x: G.hx - 34, y: G.hy - 92, w: 68, h: 60 }; },
  };
  // the dome's window (the slit, open low) with the valley at night: snow, the far ridge, a few warm lights far
  // to the southeast (Lanternfall)
  function valleyIn(g, x0, y0, ww, hh, s, rnd, lights) {
    Q.bandsIn(g, x0, y0, ww, Math.round(hh * 0.55), ['#0a1024', '#121c3a', '#1c2a50', '#28385e'], 0.45);
    for (let i = 0; i < 24; i++) R(g, x0 + Math.round(rnd() * ww), y0 + Math.round(rnd() * hh * 0.45), 1, 1, 'rgba(220,230,255,0.75)');
    const yr = y0 + Math.round(hh * 0.5);
    for (let x = x0; x < x0 + ww; x++) { const t1 = Math.round(yr - Math.abs(Math.sin((x - x0) / Math.max(4, s(19)))) * s(12)); g.fillStyle = '#9ab0cc'; g.fillRect(x, t1, 1, y0 + hh - t1); }
    Q.bandsIn(g, x0, yr + s(6), ww, y0 + hh - yr - s(6), ['#6a80a4', '#5a7096', '#4a6088', '#3e5478'], 0.4);
    if (lights) for (let i = 0; i < 7; i++) { const lx = x0 + Math.round(ww * (0.62 + rnd() * 0.3)), ly = yr + s(14) + Math.round(rnd() * s(10)); R(g, lx, ly, 1, 1, '#ffd890'); }
  }
  const go = {
    phases: [['surprise', 600], ['turn', 1100], ['comp', 900]],
    safe: { wide: 'Hoshino\'s face and the window in the top 55 %', narrow: 'his face and the window above it', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomAsk(w, h, st.vb, true), { s } = G, still = st.still;
      const wx0 = Math.round(G.hx + s(70)), wx1 = Math.min(w - s(6), wx0 + Math.max(s(90), w * 0.3));
      const S0 = cached('ch4.gowin|' + w + 'x' + h + '|' + G.vb, () => {
        const cv = mk(w, h), g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;
        g.drawImage(domeStatic(G, 'go', { floor: G.floor, slit: [s(4), s(30)], seed: 41 }).cv, 0, 0);
        // the window: an opening in the dome's wall, its shutter slid back, the valley beyond
        const wy0 = Math.max(s(8), G.hy - 96 - s(20)), wy1 = G.floor - s(6);
        valleyIn(g, wx0, wy0, wx1 - wx0, wy1 - wy0, s, P().rnd(8), true);
        const L = P().layer(w, h), rail = P().mat('#7a5a3e', { n: 6, at: 3, step: 0.08 });
        L.rect(wx0 - s(8), wy0 - s(8), wx1 - wx0 + s(16), s(8), rail, 0.7); L.rect(wx0 - s(8), wy1, wx1 - wx0 + s(16), s(8), rail, 0.4);
        L.rect(wx0 - s(8), wy0, s(8), wy1 - wy0, rail, 0.6); L.rect(wx1, wy0, s(8), wy1 - wy0, rail, 0.35);
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        return { cv, wy0 };
      });
      c.drawImage(S0.cv, 0, 0);
      // the lamp (out of frame to our left) warms him from that side
      warmth(c, -s(30), G.hy - 60, Math.round(w * 0.6), 0.55, t, still);
      const ks = st.at('surprise'), kt = st.at('turn');
      let expr = 'surprise', fr = { head: [0, -1] };
      if (kt > 0.15) { expr = kt > 0.7 ? 'smile' : 'think'; fr = { look: [1, -1], head: [1, 0] }; }
      else if (ks < 0.3) { expr = 'neutral'; fr = null; }
      hoshinoBust(c, G, expr, fr, true);
      compAside(c, G, st, st.at('comp'), -1);
    },
    focus(w, h, vb) { const G = geomAsk(w, h, vb, true); return { x: G.hx - 34, y: G.hy - 92, w: 68, h: 60 }; },
  };
  const both = {
    phases: [['think', 600], ['smile', 900], ['comp', 900]],
    safe: { wide: 'Hoshino between the lamp and the window, his face in the top 55 %', narrow: 'his face in the upper half', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomAsk(w, h, st.vb, true), { s, Lg } = G, still = st.still;
      roomWithLamp(c, G, st, t, 'both', { slit: [Math.max(s(4), G.hx - s(150)), Math.max(s(4), G.hx - s(150)) + Math.max(s(40), w * 0.12)], seed: 51, lit: 0.45 });
      const kt = st.at('think'), km = st.at('smile');
      hoshinoBust(c, G, km > 0.3 ? 'smile' : kt > 0.2 ? 'think' : 'neutral', km > 0.3 ? null : { look: [-1, -1] });
      // one hand on the lamp, the other open toward the window (and the valley) on our left
      const h1 = Q.hand({ size: 13, pose: 'rest', side: 'R', angle: 0.2, skin: skin('hoshino'), sleeve: sleeve('hoshino') });
      if (h1) c.drawImage(h1.cv, Math.round(Lg.x0 - s(12) - h1.ax), Math.round(Lg.y0 + Lg.H * 0.5 - h1.ay));
      const e = ease(Math.max(kt, km));
      const h2 = Q.hand({ size: 13, pose: 'offer', side: 'L', angle: Math.PI - lerp(0.9, 0.35, e), skin: skin('hoshino'), sleeve: sleeve('hoshino') });
      if (h2) c.drawImage(h2.cv, Math.round(lerp(G.hx - s(20), G.hx - s(70), e) - h2.ax), Math.round(lerp(G.vb + s(30), G.hy - s(40), e) - h2.ay));
      compAside(c, G, st, st.at('comp'), 1);
      void still;
    },
    focus(w, h, vb) { const G = geomAsk(w, h, vb, true); return { x: G.hx - 34, y: G.hy - 92, w: 68, h: 60 }; },
  };

  // ==== ch4.lamp · flint: the insert ============================================================================
  function geomFlint(w, h, vb) {
    const S = stage(w, h, vb), { s } = S;
    // the hands, the spark and the wick (about 56 k tall round the wick's top) fit above the sheet
    const k = clamp(Math.min((vb - s(10)) / 58, w / 150), 0.5, 3.2);
    const wx = Math.round(w * 0.5), wy = Math.round(clamp(vb * 0.62, 49 * k, vb - 9 * k));
    return Object.assign(S, { k, wx, wy });
  }
  const flint = {
    phases: [['ready', 0], ['strike', 1300]],
    safe: { wide: 'the wick, the spark and the hands central', narrow: 'the wick in the upper half', land: 'the wick and the spark' },
    draw(c, w, h, t, st) {
      const G = geomFlint(w, h, st.vb), { s, k, wx, wy } = G, still = st.still;
      const S0 = cached('ch4.flint|' + w + 'x' + h + '|' + G.vb, () => {
        const cv = mk(w, h), g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;
        const p = P();
        // inside the shade, close: the paper walls glowing faintly round us, the oil dish on its stand
        const paper = p.mat('#c8bca4', { n: 6, at: 3, step: 0.06 }), L = p.layer(w, h);
        L.rect(0, 0, w, h, paper, (x, y) => clamp(0.4 + (((Math.round(y) % Math.max(3, Math.round(7 * k))) === 0) ? -0.12 : 0) - Math.abs(x - wx) / w * 0.3, 0, 0.999));
        for (const fx of [Math.round(wx - 70 * k), Math.round(wx + 66 * k)]) L.rect(fx, 0, Math.round(4 * k), h, p.mat('#3a2e30', { n: 4, at: 2 }), 0.5);
        const clay = p.mat('#7a5a44', { n: 6, at: 3, step: 0.08 }), lac = p.mat('#2e2834', { n: 5, at: 2 });
        L.rect(wx - Math.round(6 * k), wy + Math.round(8 * k), Math.round(12 * k), h, lac, p.cyl(wx - 2, Math.round(6 * k)));
        L.ell(wx, wy + Math.round(6 * k), Math.round(24 * k), Math.round(6 * k), clay, (x, y) => (y < wy + 4 * k ? 0.85 : 0.4));
        L.ell(wx, wy + Math.round(4 * k), Math.round(19 * k), Math.round(4 * k), p.mat('#3a2a1a', { n: 4, at: 2 }), 0.5); // the oil
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        return { cv };
      });
      c.drawImage(S0.cv, 0, 0);
      const ks = st.at('strike');
      // the wick, standing out of the oil; the small orange flame on it until the strike, then the flame rising
      R(c, wx - Math.round(1 * k), wy - Math.round(5 * k), Math.max(1, Math.round(2 * k)), Math.round(9 * k), '#e8dcc0');
      const rise = ease(clamp((ks - 0.45) / 0.55, 0, 1));
      const fh = Math.round((4 + 22 * rise) * k);
      if (rise > 0 || ks <= 0) { warmth(c, wx, wy - fh / 2, Math.round((30 + 90 * rise) * k), 0.35 + 0.6 * rise, t, still); flame(c, wx, wy - Math.round(4 * k), fh, 1, t, still); }
      // the spark: a burst of bright pixels where steel meets flint (once, at the strike)
      const sp = clamp((ks - 0.25) / 0.3, 0, 1);
      if (sp > 0 && sp < 1) {
        const rnd = P().rnd(77);
        for (let i = 0; i < 14; i++) { const a = rnd() * Math.PI * 2, r = sp * (8 + rnd() * 18) * k; R(c, Math.round(wx + 8 * k + Math.cos(a) * r), Math.round(wy - 26 * k + Math.sin(a) * r * 0.7 + sp * sp * 10 * k), Math.max(1, Math.round(k * 0.8)), Math.max(1, Math.round(k * 0.8)), i % 3 ? '#ffe080' : '#fff8e0'); }
      }
      // your hand from the lower left with the slip of paper (last night's word: marks only), held to the spark
      const pk = pcSkin(st), ps = pcSleeve(st);
      const slipX = Math.round(wx - 22 * k + rise * 6 * k), slipY = Math.round(wy - 18 * k);
      R(c, slipX - Math.round(8 * k), slipY - Math.round(3 * k), Math.round(16 * k), Math.round(6 * k), '#ece2c8');
      R(c, slipX - Math.round(6 * k), slipY - Math.round(1 * k), Math.round(10 * k), Math.max(1, Math.round(k)), '#2a2024');
      if (sp > 0.5) { c.fillStyle = 'rgba(255,200,110,' + (0.5 * (1 - rise)).toFixed(2) + ')'; c.fillRect(slipX + Math.round(6 * k), slipY - Math.round(3 * k), Math.round(3 * k), Math.round(6 * k)); }
      const ph = Q.hand({ size: Math.round(14 * k), pose: 'pinch', side: 'R', angle: -0.35, skin: pk, sleeve: ps });
      if (ph) c.drawImage(ph.cv, Math.round(slipX - 24 * k - ph.ax), Math.round(slipY + 8 * k - ph.ay));
      // Hoshino's hands from the upper right: the flint in one, the steel striker in the other
      const strike = ks > 0.2 && ks < 0.35 ? 1 : 0;
      const fx = Math.round(wx + 30 * k), fy = Math.round(wy - 40 * k + strike * 6 * k);
      R(c, fx - Math.round(6 * k), fy - Math.round(4 * k), Math.round(10 * k), Math.round(7 * k), '#8a8a92'); R(c, fx - Math.round(6 * k), fy - Math.round(4 * k), Math.round(10 * k), 1, '#b8b8c0');
      const h1 = Q.hand({ size: Math.round(14 * k), pose: 'grip', side: 'L', angle: Math.PI + 0.6, skin: skin('hoshino'), sleeve: sleeve('hoshino') });
      if (h1) c.drawImage(h1.cv, Math.round(fx + 10 * k - h1.ax), Math.round(fy - 4 * k - h1.ay));
      const sx = Math.round(wx + 16 * k - (ks > 0.15 && ks < 0.3 ? 4 * k : 0)), sy = Math.round(wy - 20 * k);
      R(c, sx - Math.round(8 * k), sy, Math.round(14 * k), Math.max(2, Math.round(2.4 * k)), '#3a3a42'); R(c, sx - Math.round(8 * k), sy, Math.round(14 * k), 1, '#7a7a86');
      const h2 = Q.hand({ size: Math.round(14 * k), pose: 'grip', side: 'R', angle: Math.PI - 0.3, skin: skin('hoshino'), sleeve: sleeve('hoshino') });
      if (h2) c.drawImage(h2.cv, Math.round(sx + 14 * k - h2.ax), Math.round(sy + 4 * k - h2.ay));
    },
    focus(w, h, vb) { const G = geomFlint(w, h, vb), k = G.k; return { x: Math.round(G.wx - 40 * k), y: Math.round(G.wy - 48 * k), w: Math.round(80 * k), h: Math.round(Math.min(vb - 2, G.wy + 8 * k) - (G.wy - 48 * k)) }; },
  };

  // ==== ch4.lamp · valley: outside, the light pouring out ========================================================
  function geomValley(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow', land = lay === 'land';
    const ox = Math.round(w * (narrow ? 0.3 : 0.2)), oy = Math.round(vb * (narrow ? 0.3 : land ? 0.5 : 0.34));    // the dome's window
    const tx = Math.round(w * (narrow ? 0.9 : 0.86)), ty = Math.round(vb * (narrow ? 0.66 : land ? 0.94 : 0.8));   // Lanternfall, far
    return Object.assign(S, { ox, oy, tx, ty });
  }
  function valleyStatic(G) {
    return cached('ch4.valley|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, ox, oy, tx, ty } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(313);
      Q.bandsIn(g, 0, 0, w, h, ['#060a1c', '#0a1026', '#0e1630', '#141e3a', '#1a2644', '#22304e'], 0.45);
      for (let i = 0; i < 90; i++) R(g, Math.round(rnd() * w), Math.round(rnd() * h * 0.6), 1, 1, i % 7 ? 'rgba(220,230,255,0.7)' : '#fff6dc');
      const L = p.layer(w, h);
      // far ridges across the valley, snow-lit by the stars; the valley floor; the near mountain shoulder with the
      // observatory on it at the left
      const snow = p.mat('#7a8cac', { n: 6, at: 3, step: 0.07 }), near = p.mat('#a8b8d0', { n: 6, at: 3, step: 0.07 });
      const ridge = (x) => Math.round(ty - s(26) - Math.abs(Math.sin(x / s(53) + 1)) * s(18) - (1 - x / w) * s(10));
      L.fill(0, 0, w, h, (x, y) => y >= ridge(x), snow, (x, y) => clamp(0.4 + (Math.sin(x / s(53) + 1) > 0 ? 0.12 : -0.05) - (y - ridge(x)) / h * 0.4, 0, 0.999));
      const sh = (x) => Math.round(oy + s(20) + Math.pow(Math.max(0, x - ox) / (w * 0.6), 1.4) * (h - oy) * 1.1 - (x < ox ? (ox - x) * 0.15 : 0));
      L.fill(0, 0, w, h, (x, y) => y >= sh(x), near, (x, y) => clamp(0.62 - (y - sh(x)) / h * 0.3 + (((x * 5 + y * 3) % 19) === 0 ? 0.08 : 0), 0, 0.999));
      // the observatory: the stone drum, the white dome, the slit (the window the light comes from)
      const stone = p.mat('#6a6a78', { n: 6, at: 3, step: 0.08 }), dome = p.mat('#c8d4e2', { n: 6, at: 3, step: 0.07 });
      const dw = s(30), dbase = oy + s(22);
      L.rect(ox - dw, oy - s(4), dw * 2, dbase - oy + s(4), stone, (x, y) => ((Math.round(y) % s(6)) === 0 ? 0.25 : x < ox ? 0.6 : 0.4));
      L.fill(ox - dw - s(2), oy - dw, ox + dw + s(2), oy, (x, y) => ((x - ox) / (dw + 2)) ** 2 + ((y - oy) / (dw * 0.85)) ** 2 <= 1, dome, p.sphere(ox - dw * 0.3, oy - dw * 0.6, dw, dw * 0.85, { amb: 0.35 }));
      L.rect(ox - s(4), oy - Math.round(dw * 0.8), s(8), Math.round(dw * 0.8) + s(10), p.mat('#1a2030', { n: 3, at: 1 }), 1);
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // Lanternfall's lights, far to the southeast, and the stair's dark line on our mountain
      for (let i = 0; i < 12; i++) { const lx = tx + Math.round((rnd() - 0.5) * s(40)), ly = ty + Math.round(rnd() * s(10)); R(g, lx, ly, 1, 1, i % 3 ? '#e8b060' : '#fff0b0'); }
      return { cv, dbase };
    });
  }
  const valley = {
    phases: [['pour', 1500]],
    safe: { wide: 'the dome top-left, the light across the valley above the sheet', narrow: 'the dome above, the light down to the far lights', land: 'the dome and the light leaving it' },
    draw(c, w, h, t, st) {
      const G = geomValley(w, h, st.vb), { s, ox, oy, tx, ty } = G, still = st.still;
      c.drawImage(valleyStatic(G).cv, 0, 0);
      const k = ease(st.at('pour'));
      // the lamp in the slit
      c.fillStyle = '#ffc060'; c.fillRect(ox - s(3), oy - s(14), s(6), s(14)); c.fillStyle = '#fff4b8'; c.fillRect(ox - s(1), oy - s(10), s(2), s(8));
      P().halo(c, ox, oy - s(7), s(26), '255,190,110', 0.3, 4);
      // the light pouring out across the valley: a widening band of stepped warm light toward the far town
      const ex = lerp(ox, tx + s(30), k), ey = lerp(oy - s(7), ty + s(4), k);
      const steps = 4;
      for (let i = steps; i >= 1; i--) {
        const wd = (i / steps) * s(46);
        c.fillStyle = 'rgba(255,200,120,' + (0.07 * (still ? 1 : 0.92 + 0.08 * Math.sin(t / 900))).toFixed(3) + ')';
        c.beginPath(); c.moveTo(ox, oy - s(14)); c.lineTo(ex, ey - wd * k); c.lineTo(ex, ey + wd * 0.5 * k); c.lineTo(ox, oy); c.closePath(); c.fill();
      }
      // where it reaches, the far lights brighten
      if (k > 0.8) { c.globalAlpha = (k - 0.8) / 0.2; P().halo(c, tx, ty + s(4), s(26), '255,210,140', 0.22, 3); c.globalAlpha = 1; }
      // snow glinting in the light (ambient)
      if (!still) Q.dust(c, ox, oy, Math.max(4, ex - ox), Math.max(oy + 4, ey), 0, t, 10, '255,236,200', still, 5);
    },
    focus(w, h, vb) { const G = geomValley(w, h, vb); return { x: G.ox - G.s(34), y: Math.max(0, G.oy - G.s(36)), w: G.tx + G.s(30) - (G.ox - G.s(34)), h: Math.min(vb - 2, G.ty + G.s(16)) - Math.max(0, G.oy - G.s(36)) }; },
  };

  RB.sequence.define('ch4.lamp', {
    title: { en: 'The lamp\'s name holds', jp: '{灯|あか}り の {名前|なまえ}' }, chapter: 4, scene: 'sb.lamp_name', memory: true,
    memo: { jp: '', en: 'In the observatory, the name on the lamp\'s shade held, and its light went out across the valley toward Lanternfall.' },
    shots: { akari, ask, stay, go, both, flint, valley },
  });

  // ==== ch4.reply · seal: the envelope sealed, the address left blank ===========================================
  function geomSeal(w, h, vb) {
    const S = stage(w, h, vb), { s } = S;
    // the envelope (64 k tall) and the hand turning it fit above the sheet
    const k = clamp(Math.min((vb - s(8)) / 70, w / 130), 0.5, 3.2);
    return Object.assign(S, { k, ex: Math.round(w * 0.5), ey: Math.round(clamp(vb * 0.52, 35 * k, vb - 35 * k)) });
  }
  // the envelope: back (the flap, its seal) or front (the address panel: a ruled box, empty)
  function envelope(c, x, y, k, side, sealed) {
    const W = Math.round(40 * k), H = Math.round(64 * k), x0 = Math.round(x - W / 2), y0 = Math.round(y - H / 2);
    R(c, x0 + Math.round(3 * k), y0 + Math.round(4 * k), W, H, 'rgba(30,16,8,0.35)');
    R(c, x0, y0, W, H, '#e8dcc0'); R(c, x0, y0, W, 1, '#f8f0dc'); R(c, x0, y0 + H - 1, W, 1, '#b8a888'); R(c, x0 + W - 1, y0, 1, H, '#c8b898');
    if (side === 'back') {
      // the flap folded down over the top, the seal across its point
      c.fillStyle = '#dcd0b2'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + W, y0); c.lineTo(x0 + W, y0 + Math.round(10 * k)); c.lineTo(x0 + W / 2, y0 + Math.round(18 * k)); c.lineTo(x0, y0 + Math.round(10 * k)); c.closePath(); c.fill();
      if (sealed > 0) { c.globalAlpha = step4(sealed); c.fillStyle = '#9a2a24'; P().disc(c, x0 + Math.round(W / 2), y0 + Math.round(17 * k), Math.max(2, Math.round(5 * k))); c.fillStyle = '#c84a3a'; c.fillRect(x0 + Math.round(W / 2) - Math.round(2 * k), y0 + Math.round(15 * k), Math.max(1, Math.round(2 * k)), 1); c.globalAlpha = 1; }
    } else {
      // the front: a red-ruled address panel down the middle, left empty; a small stamp box at the corner
      R(c, x0 + Math.round(13 * k), y0 + Math.round(10 * k), Math.round(14 * k), Math.round(46 * k), '#f2eadc');
      c.strokeStyle = '#b84a3a'; c.lineWidth = 1; c.strokeRect(x0 + Math.round(13 * k) + 0.5, y0 + Math.round(10 * k) + 0.5, Math.round(14 * k), Math.round(46 * k));
      c.strokeRect(x0 + Math.round(4 * k) + 0.5, y0 + Math.round(4 * k) + 0.5, Math.round(7 * k), Math.round(8 * k));
    }
    return { x0, y0, W, H };
  }
  const seal = {
    phases: [['seal', 1200]],
    safe: { wide: 'the envelope central above the sheet', narrow: 'the envelope in the upper half', land: 'the envelope' },
    draw(c, w, h, t, st) {
      const G = geomSeal(w, h, st.vb), { s, k, ex, ey } = G, still = st.still;
      const S0 = cached('ch4.desk|' + w + 'x' + h + '|' + G.vb, () => {
        const cv = mk(w, h), g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;
        const p = P(), L = p.layer(w, h), desk = p.mat('#5a4030', { n: 7, at: 3, step: 0.07 });
        L.rect(0, 0, w, h, desk, (x, y) => clamp(0.48 - Math.abs(y - ey) / h * 0.3 + (Math.sin(y * 0.5 + Math.sin(x * 0.02) * 3) > 0.86 ? 0.1 : 0), 0, 0.999));
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        // the inkstone, the brush laid on its rest, the finished letter's sheets beside
        R(g, ex - Math.round(70 * k), ey - Math.round(20 * k), Math.round(18 * k), Math.round(26 * k), '#2a2a30'); R(g, ex - Math.round(70 * k), ey - Math.round(20 * k), Math.round(18 * k), 1, '#4a4a52');
        R(g, ex - Math.round(66 * k), ey + Math.round(12 * k), Math.round(26 * k), Math.max(1, Math.round(2 * k)), '#8a6a44'); R(g, ex - Math.round(66 * k), ey + Math.round(12 * k), Math.round(5 * k), Math.max(1, Math.round(2 * k)), '#1e1418');
        return { cv };
      });
      c.drawImage(S0.cv, 0, 0);
      // the lamp above, out of frame: its warm light on the desk
      warmth(c, ex + Math.round(20 * k), ey - Math.round(60 * k), Math.round(110 * k), 0.85, t, still);
      const ks = st.at('seal'), press = ease(clamp(ks / 0.45, 0, 1)), turn = ease(clamp((ks - 0.5) / 0.5, 0, 1));
      // first the seal pressed onto the flap; then the envelope turned over to its front: the address left blank
      const flip = turn < 0.5 ? 1 - turn * 2 : (turn - 0.5) * 2, side = turn < 0.5 ? 'back' : 'front';
      c.save(); c.translate(ex, ey); c.scale(Math.max(0.08, flip), 1); c.translate(-ex, -ey);
      envelope(c, ex, ey, k, side, press);
      c.restore();
      // his hand: pressing the seal, then turning the envelope (from the right)
      const hk = Math.round(13 * k);
      const hd = Q.hand({ size: hk, pose: turn > 0 && turn < 1 ? 'pinch' : 'rest', side: 'L', angle: Math.PI + (turn > 0 ? 0.2 : 0.9), skin: skin('hoshino'), sleeve: sleeve('hoshino') });
      if (hd) {
        const hx = turn > 0 ? ex + Math.round(24 * k * Math.max(0.1, flip)) : lerp(ex + Math.round(40 * k), ex + Math.round(6 * k), press < 1 ? Math.sin(Math.PI * press) : 0);
        const hy = turn > 0 ? ey : ey - Math.round(12 * k);
        if (!(turn >= 1)) c.drawImage(hd.cv, Math.round(hx - hd.ax), Math.round(hy - hd.ay));
        else { const h2 = Q.hand({ size: hk, pose: 'rest', side: 'L', angle: Math.PI + 0.2, skin: skin('hoshino'), sleeve: sleeve('hoshino') }); if (h2) c.drawImage(h2.cv, Math.round(ex + 34 * k - h2.ax), Math.round(ey + 14 * k - h2.ay)); }
      }
    },
    focus(w, h, vb) { const G = geomSeal(w, h, vb), k = G.k; return { x: Math.round(G.ex - 22 * k), y: Math.round(G.ey - 34 * k), w: Math.round(44 * k), h: Math.round(Math.min(vb - 2, G.ey + 34 * k) - (G.ey - 34 * k)) }; },
  };
  // ==== ch4.reply · give: Hoshino holds it out; your hand takes it ===============================================
  const give = {
    phases: [['offer', 800], ['take', 900]],
    safe: { wide: 'Hoshino\'s face and the envelope in the top 55 %', narrow: 'his face, the envelope below it', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomAsk(w, h, st.vb, true), { s } = G, still = st.still;
      roomWithLamp(c, G, st, t, 'give', { slit: [w * 0.04, w * 0.04 + Math.max(s(30), w * 0.08)], seed: 61, lit: 1 });
      const ko = st.at('offer'), kt = st.at('take');
      hoshinoBust(c, G, 'smile', ko < 0.5 ? { look: [0, 1] } : null);
      // the envelope held out toward you in both his hands; on the giving, your hand takes it and it is yours
      const e = ease(ko), tk = ease(kt);
      const ex = Math.round(lerp(G.hx, G.hx - s(46), e) - tk * s(40)), ey = Math.round(lerp(G.vb + s(20), G.hy - s(30), e) + tk * s(50));
      const k = clamp(G.Z * 0.8, 0.6, 1.1);
      c.save(); c.translate(ex, ey); c.rotate(-0.25); c.translate(-ex, -ey); envelope(c, ex, ey, k, 'front', 1); c.restore();
      if (tk < 0.5) {
        for (const [dx, side] of [[-s(16), 'R'], [s(16), 'L']]) {
          const hd = Q.hand({ size: 11, pose: 'pinch', side, angle: side === 'R' ? -0.2 : Math.PI + 0.2, skin: skin('hoshino'), sleeve: sleeve('hoshino') });
          if (hd) c.drawImage(hd.cv, Math.round(ex + dx - hd.ax), Math.round(ey + s(6) - hd.ay));
        }
      }
      if (kt > 0) {
        const ph = Q.hand({ size: 13, pose: 'pinch', side: 'R', angle: -0.5, skin: pcSkin(st), sleeve: pcSleeve(st) });
        if (ph) c.drawImage(ph.cv, Math.round(lerp(-s(20), ex - s(22), Math.min(1, kt * 1.6)) - ph.ax), Math.round(lerp(G.vb + s(30), ey + s(8), Math.min(1, kt * 1.6)) - ph.ay));
      }
      void still;
    },
    focus(w, h, vb) { const G = geomAsk(w, h, vb, true); return { x: G.hx - 34, y: G.hy - 92, w: 68, h: 60 }; },
  };
  RB.sequence.define('ch4.reply', {
    title: { en: 'The address left blank', jp: '{宛名|あてな} は {空|あ}けた まま' }, chapter: 4, scene: 'sb.lamp_reply',
    shots: { seal, give },
  });

  // ==== the upstairs window at Yukimiya (ch4.inn at night, ch4.morning after the storm) =============================
  function geomWin(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow';
    const x0 = Math.round(w * (narrow ? 0.08 : 0.2)), x1 = Math.round(w * (narrow ? 0.92 : 0.8)), y0 = Math.round(Math.max(s(10), vb * 0.06)), y1 = Math.round(vb * (narrow ? 0.78 : 0.86));
    const mx = Math.round(lerp(x0, x1, 0.62)), my = Math.round(lerp(y0, y1, 0.2));   // the observatory on the mountain
    return Object.assign(S, { x0, x1, y0, y1, mx, my });
  }
  // the view: the mountain with the observatory near its top, the hamlet's snowy roofs below; night or morning
  function viewStatic(G, morning) {
    return cached('ch4.view|' + (morning ? 'm' : 'n') + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, x0, x1, y0, y1, mx, my } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(morning ? 202 : 101);
      const vw = x1 - x0, vh = y1 - y0;
      if (morning) Q.bandsIn(g, x0, y0, vw, vh, ['#3a7ad0', '#4a8ad8', '#62a0e0', '#82b6e8', '#a8ccee'], 0.45);
      else { Q.bandsIn(g, x0, y0, vw, vh, ['#060a1c', '#0a1026', '#0e1630', '#141e3a', '#1a2644'], 0.45); for (let i = 0; i < 50; i++) R(g, x0 + Math.round(rnd() * vw), y0 + Math.round(rnd() * vh * 0.5), 1, 1, 'rgba(220,230,255,0.7)'); }
      const L = p.layer(w, h);
      const snow = p.mat(morning ? '#e8f0f8' : '#6a7c9c', { n: 6, at: 3, step: morning ? 0.04 : 0.07 });
      const mtn = (x) => Math.round(my + s(14) + Math.abs(x - mx) * 0.55 + Math.sin(x / s(31)) * s(4));
      L.fill(x0, y0, x1, y1, (x, y) => y >= mtn(x), snow, (x, y) => clamp((x < mx ? 0.78 : 0.5) - (y - mtn(x)) / vh * 0.25 + (((x * 7 + y * 3) % 29) === 0 ? 0.08 : 0), 0, 0.999));
      // the observatory: drum and dome
      const stone = p.mat('#6a6a78', { n: 5, at: 2 }), dome = p.mat(morning ? '#f0f4fa' : '#a8b8cc', { n: 5, at: 3 });
      L.rect(mx - s(9), my, s(18), s(10), stone, (x) => (x < mx ? 0.6 : 0.35));
      L.ell(mx, my, s(10), s(8), dome, (x, y) => (y > my ? -1 : x < mx ? 0.85 : 0.5));
      L.rect(mx - 1, my - s(7), Math.max(2, s(2)), s(9), p.mat('#1a2030', { n: 3, at: 1 }), 1);
      // the hamlet's roofs in the snow below
      const roofM = p.mat(morning ? '#f4f8fc' : '#7a8aa6', { n: 5, at: 3, step: 0.05 }), wallM = p.mat(morning ? '#7a5a44' : '#2a2430', { n: 4, at: 2 });
      for (let i = 0; i < 9; i++) {
        const rx = x0 + Math.round(vw * (i / 8)) + Math.round((rnd() - 0.5) * s(16)), ry = y1 - s(10) - Math.round(rnd() * s(16)), rw = s(26) + Math.round(rnd() * s(10));
        L.rect(rx - rw / 2 + s(3), ry, rw - s(6), y1 - ry, wallM, 0.5);
        L.poly([[rx - rw / 2 - s(3), ry + s(2)], [rx, ry - s(12)], [rx + rw / 2 + s(3), ry + s(2)]], roofM, (x) => (x < rx ? 0.85 : 0.5));
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the room around the window: a dim plaster wall, the frame and the shōji slid back, the sill
      const W2 = p.layer(w, h), wall = p.mat(morning ? '#9a8a78' : '#3a3440', { n: 6, at: 3, step: 0.07 }), wood = p.mat('#5a4030', { n: 5, at: 2, step: 0.08 });
      W2.rect(0, 0, w, h, wall, (x, y) => clamp(0.48 + (((x * 3 + y * 7) % 19) === 0 ? 0.06 : 0) - Math.abs(x - w / 2) / w * 0.2, 0, 0.999));
      W2.erase(x0, y0, x1, y1, () => true);
      W2.rect(x0 - s(8), y0 - s(8), x1 - x0 + s(16), s(8), wood, 0.7); W2.rect(x0 - s(8), y1, x1 - x0 + s(16), s(12), wood, (x, y) => (y < y1 + 2 ? 0.9 : 0.45));
      W2.rect(x0 - s(8), y0, s(8), y1 - y0, wood, 0.6); W2.rect(x1, y0, s(8), y1 - y0, wood, 0.3);
      W2.rect(Math.round((x0 + x1) / 2) - s(2), y0, s(4), y1 - y0, wood, 0.5);
      const shoji = Math.round((x1 - x0) * 0.2);
      Q.shoji(W2, x1 - shoji, y0, shoji, y1 - y0, s, p.mat(morning ? '#f4ece0' : '#8a8478', { n: 4, at: 2 }), p.mat('#5a4030', { n: 4, at: 2 }), morning ? 0.6 : 0);
      W2.outline();
      g.drawImage(W2.canvas(), 0, 0);
      return { cv };
    });
  }
  const night = {
    phases: [['out', 1100]],
    safe: { wide: 'the window and the mountain\'s light in the top 60 %', narrow: 'the window in the upper half', land: 'the light on the mountain' },
    draw(c, w, h, t, st) {
      const G = geomWin(w, h, st.vb), { s, mx, my, x0, y1 } = G, still = st.still;
      c.drawImage(viewStatic(G, false).cv, 0, 0);
      // the lamp on the mountain, lit (and its light, steady)
      const fl = still ? 1 : 0.9 + 0.1 * Math.sin(t / 700);
      c.globalAlpha = fl; P().halo(c, mx, my - s(2), s(22), '255,200,120', 0.3, 4); c.globalAlpha = 1;
      R(c, mx - 1, my - s(5), Math.max(2, s(2)), s(4), '#ffd27a'); R(c, mx - 1, my - s(4), 1, s(2), '#fff4c8');
      // the candle on the sill, put out (a thread of smoke, then nothing); the room goes to the snow-light
      const k = st.at('out'), cx = Math.round(x0 + s(30)), cy = y1;
      R(c, cx - s(2), cy - s(10), s(4), s(10), '#e8e0d0'); R(c, cx - s(2), cy - s(10), 1, s(10), '#fff8ec'); R(c, cx - s(5), cy - 1, s(10), s(2), '#6a5040');
      if (k < 0.35) { const a = 1 - k / 0.35; c.globalAlpha = a; P().halo(c, cx, cy - s(14), s(30), '255,190,110', 0.3, 3); flame(c, cx, cy - s(10), s(7), 1, t, still); c.globalAlpha = 1; }
      else if (k < 1 && !still) { for (let i = 0; i < 8; i++) { const yy = cy - s(12) - i * s(3) * k; c.fillStyle = 'rgba(200,200,210,' + (0.4 * (1 - k)).toFixed(2) + ')'; c.fillRect(Math.round(cx + Math.sin(i * 0.9 + t / 300) * s(2)), Math.round(yy), 1, s(2)); } }
      // the room darkens a step as the candle goes out
      c.fillStyle = 'rgba(10,12,30,' + (0.25 * ease(k)).toFixed(2) + ')'; c.fillRect(0, 0, w, h);
      c.globalAlpha = 1; P().halo(c, mx, my - s(2), s(10), '255,210,140', 0.25 * ease(k), 2); c.globalAlpha = 1;
    },
    focus(w, h, vb) { const G = geomWin(w, h, vb); return { x: G.mx - G.s(24), y: Math.max(0, G.my - G.s(24)), w: G.s(48), h: G.s(40) }; },
  };
  RB.sequence.define('ch4.inn', {
    title: { en: 'A night at Yukimiya', jp: '{雪見屋|ゆきみや} の {夜|よる}' }, chapter: 4, scene: 'sb.next_day_inn',
    shots: { night },
  });
  const snow = {
    phases: [['glare', 1300]],
    safe: { wide: 'the window and the white world in the top 60 %', narrow: 'the window in the upper half', land: 'the mountain in the window' },
    draw(c, w, h, t, st) {
      const G = geomWin(w, h, st.vb), { s, x0, x1, y0, y1 } = G, still = st.still;
      c.drawImage(viewStatic(G, true).cv, 0, 0);
      // the glare off the snow as the eyes adjust: bright at first, settling
      const k = st.at('glare');
      c.fillStyle = 'rgba(255,255,255,' + (0.55 * (1 - ease(k))).toFixed(3) + ')'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      // light on the sill and the floor from the window
      c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x0 - s(8), y1, x1 - x0 + s(16), h - y1);
      // glints in the snow (ambient)
      if (!still) { const rnd = P().rnd(17); for (let i = 0; i < 16; i++) { const gx = x0 + Math.round(rnd() * (x1 - x0)), gy = Math.round(lerp(G.my + s(20), y1, rnd())), on = Math.floor(t / 400 + i * 3) % 6 === 0; if (on) R(c, gx, gy, 1, 1, '#ffffff'); } }
    },
    focus(w, h, vb) { const G = geomWin(w, h, vb); return { x: G.x0, y: G.y0, w: G.x1 - G.x0, h: Math.min(vb - 2, G.y1) - G.y0 }; },
  };
  RB.sequence.define('ch4.morning', {
    title: { en: 'The morning after the storm', jp: '{嵐|あらし} の {後|あと} の {朝|あさ}' }, chapter: 4, scene: 'sb.quiet_morning',
    shots: { snow },
  });
})();
