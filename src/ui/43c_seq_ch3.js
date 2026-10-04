/* Chapter 3's illustrated sequences (docs/expressive/SHOTS.md §3 and §7b).
 *
 * ch3.assembly — the assembly at dusk (`co.assembly`, src/content/ch3/43_scenes_end.js). The square of the map
 * `co.eve`: the half-decorated stage on the north side (its bunting half hung, a ladder still against a post,
 * the paper lanterns on the crossbeam dark), the villagers where the map stands them, you and your companion
 * among them. The sun has just gone behind the western ridge: our left when we face the stage, our right from
 * it. Compositions:
 *   dusk    from behind the crowd: Tokiwa on the stage with the chronicle; the murmur (heads turn to each
 *           other, one laugh stops halfway); Sayo's start on "a fire?"
 *   confess medium on Tokiwa from below the stage, the chronicle held to his chest, Tamotsu's back at the edge:
 *           his head lowers on the confession and comes up when he asks the village to decide
 *   voices  the reverse, over Tokiwa's shoulder: Fusa, Nobu, Ume and Gorō speak up, each on their own line;
 *           then every face turns to the travellers (the challenge and the choice are answered over it)
 *   names   (one branch) close on Tokiwa reading; a paper lantern behind him lit for each name; Gorō below,
 *           his head lowering at "Mitsu"
 *   living  (one branch) Heita with a sickle he half raises, the crowd behind him; Tamotsu's back and his
 *           pointing hand at the edge
 *   ume     (one branch) close on Ume under the eaves and the drying persimmons, remembering; she looks up
 *   hands   the square from the stage: two hands, then Fusa's (close, in front), then every hand
 *   ink     the chronicle open at the page from twenty years ago: the trembling brush adds a column; the ink
 *           sinks into the paper instead of fading (in place of the scene's screen shake)
 *   night   the opening view again, after dark: the lanterns lit, people holding one another; your companion's
 *           own small gesture on their aside
 * ch3.firebreaks — the faded passage filled (`co.festival_begin`): the morning of village labour, four lines once
 * read over black, becomes four pictures: the climb up the terraces at dawn with sickles, Heita first; the top
 * water gate opened and the water falling terrace to terrace; three bands of yellow stubble across the hill by
 * early afternoon; the new rope on Gorō's lookout, everyone looking up at it.
 * People are the game's own drawings (road sprites with their poses, portraits), graded into the light. No
 * letters, kana or kanji are drawn: the chronicle's writing is a texture of marks, never characters. */
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
  const shadow = (c, x, y, r, a) => { c.fillStyle = 'rgba(28,14,24,' + (a || 0.3) + ')'; P().disc(c, Math.round(x), Math.round(y), Math.max(2, Math.round(r)), Math.max(1, Math.round(r * 0.28))); };
  const skin = (id) => Q.skinOf(look(id));
  const sleeve = (id) => (look(id).cloth || ['#555'])[0];

  // ---- light ----------------------------------------------------------------------------------------------
  // dusk: the sun just behind the western ridge (a rim on the side toward it); the far rows in the square's shade
  const DUSK_L = { mul: [0.84, 0.75, 0.78], add: [14, 4, 10], rim: { side: 'l', col: '#ffb27a', k: [0.42, 0.18] } };
  const DUSK_R = { mul: [0.84, 0.75, 0.78], add: [14, 4, 10], rim: { side: 'r', col: '#ffb27a', k: [0.42, 0.18] } };
  const DUSK_FAR = { mul: [0.72, 0.64, 0.72], add: [16, 6, 18] };
  const FACE_L = { mul: [0.98, 0.9, 0.88], add: [10, 3, 4], rim: { side: 'l', col: '#ffc48a', k: [0.42, 0.16], below: 0.85 } };
  const FACE_R = { mul: [0.98, 0.9, 0.88], add: [10, 3, 4], rim: { side: 'r', col: '#ffc48a', k: [0.42, 0.16], below: 0.85 } };
  // after dark, in the lanterns' light: dim and cool, warmed from above
  const LAMP = { mul: [0.6, 0.52, 0.62], add: [30, 16, 10], rim: { side: 't', col: '#ffc070', k: [0.5, 0.22] } };
  // the terraces: dawn from the east (our right), the early afternoon sun high on the left
  const DAWN = { mul: [0.92, 0.84, 0.86], add: [16, 6, 6], rim: { side: 'r', col: '#ffd0a0', k: [0.45, 0.2] } };
  const NOON = { mul: [1, 0.97, 0.92], add: [6, 4, 0], rim: { side: 'l', col: '#fff0c8', k: [0.4, 0.18] } };

  // ---- sky, hills, roofs ------------------------------------------------------------------------------------
  const DUSK = ['#262650', '#33305c', '#463864', '#644268', '#8c4e66', '#b45e5e', '#d47a52', '#eaa058'];
  const NIGHT = ['#0e1028', '#141634', '#1a1c3e', '#222246', '#2c284c', '#3a3050'];
  function sky(g, w, yH, s, rnd, night, cols) {
    Q.bandsIn(g, 0, 0, w, yH, cols || (night ? NIGHT : DUSK), 0.45);
    const p = P();
    // long clouds, their undersides catching the gone sun (at night: dark shapes on the dark)
    const CL = p.layer(w, Math.max(4, yH));
    const cm = p.mat(night ? '#262844' : '#5a3e66', { n: 5, at: 2, step: 0.08 });
    for (const [fx, fy, cw] of [[0.22, 0.3, 0.3], [0.7, 0.2, 0.4], [0.5, 0.52, 0.22], [0.92, 0.46, 0.2]]) {
      const cx = Math.round(w * fx), cy = Math.round(yH * fy), W2 = Math.round(w * cw / 2), th = Math.max(2, s(3));
      CL.fill(cx - W2, cy - th, cx + W2, cy + th, (x, y) => Math.abs(y - cy) <= th * (1 - Math.pow(Math.abs(x - cx) / W2, 3)), cm, (x, y) => (night ? 0.4 : y > cy ? 0.98 : 0.5));
    }
    g.drawImage(CL.canvas(), 0, 0);
    for (let i = 0; i < (night ? 46 : 12); i++) {
      const x = Math.round(rnd() * w), y = Math.round(rnd() * yH * (night ? 0.8 : 0.4));
      R(g, x, y, 1, 1, night ? (i % 5 ? 'rgba(220,226,255,0.7)' : '#fff8e0') : 'rgba(240,232,255,0.55)');
    }
  }
  // the western ridge, and the terraced hill behind the village: stepped terraces (a lit lip over a shaded
  // face), persimmon trees along them
  function hills(L, w, yH, s, rnd, o) {
    o = o || {};
    const p = P(), night = !!o.night;
    const far = p.mat(night ? '#1c1c34' : '#43355a', { n: 4, at: 2 }), hill = p.mat(night ? '#1e2422' : o.col || '#4a4436', { n: 6, at: 3, step: 0.07 });
    const ridge = (x) => yH - s(12) - Math.round(Math.sin(x / (w * 0.13) + 0.7) * s(6) + Math.sin(x / (w * 0.05)) * s(2));
    L.fill(0, 0, w, yH + s(4), (x, y) => y >= ridge(x), far, 2);
    const cxh = o.cx != null ? o.cx : w * 0.3;
    const top = (x) => yH - s(o.rise || 34) + Math.round(Math.pow(Math.abs(x - cxh) / (w * 0.6), 1.5) * s(o.rise || 34));
    const step = Math.max(4, s(o.step || 7));
    L.fill(0, 0, w, o.to || yH + s(90), (x, y) => y >= top(x), hill, (x, y) => {
      const d = y - top(x), band = Math.floor(d / step), within = d - band * step;
      const tilt = Math.round(Math.sin(x / (w * 0.09) + band * 1.3) * 1.2);
      if (within === 0 + tilt || within === 1 + tilt) return night ? 0.32 : 0.74;        // the terrace's lit lip
      return clamp((night ? 0.2 : 0.46) - (within / step) * 0.14 - (x / w) * 0.08 + (band % 2 ? 0.04 : 0), 0, 0.999);
    });
    const tree = p.mat(night ? '#18221c' : '#3a4630', { n: 4, at: 2 });
    for (let i = 0; i < (o.trees || 22); i++) {
      const x = Math.round(rnd() * w), t0 = top(x);
      if (t0 > yH) continue;
      const y = t0 + step * (1 + Math.floor(rnd() * Math.max(1, (yH - t0) / step - 1)));
      const r = Math.max(2, s(3) + Math.round(rnd() * s(2)));
      L.ell(x, y - r, r, Math.round(r * 0.8), tree, (xx, yy) => (xx < x - r * 0.2 && yy < y - r ? 0.85 : 0.4));
    }
    return { top, ridge, step };
  }
  function fruit(g, w, yH, s, top, rnd, n) {
    for (let i = 0; i < (n || 28); i++) { const x = Math.round(rnd() * w), t0 = top(x); if (t0 > yH - s(4)) continue; const y = t0 + s(3) + Math.round(rnd() * Math.max(1, yH - t0 - s(8))); R(g, x, y, 1, 1, i % 3 ? '#e07a30' : '#f0a040'); }
  }
  // a row of village roofs: thatch, tile and ash-glazed; walls (down to `wallTo` if given) with warm windows
  function roofs(L, w, yR, s, rnd, o) {
    o = o || {};
    const p = P();
    const mats = [p.mat('#8a7448', { n: 5, at: 3, step: 0.08 }), p.mat('#4a4e5e', { n: 5, at: 2, step: 0.09 }), p.mat('#6a6266', { n: 5, at: 2, step: 0.08 })];
    const wall = p.mat(o.night ? '#2e2624' : '#4a3a32', { n: 5, at: 2 });
    const wins = [];
    // the lane and the farther houses behind, in shadow (so no sky shows between the roofs)
    L.rect(0, yR - s(6), w, (o.wallTo != null ? o.wallTo : yR + s(18)) - yR + s(6), wall, (x, y) => (((Math.round(x) % s(13)) < 1) ? 0.08 : 0.22));
    for (let x = -s(10); x < w + s(10);) {
      const hw = s(26) + Math.round(rnd() * s(20)), rh = s(12) + Math.round(rnd() * s(6)), M = mats[Math.floor(rnd() * 3)];
      const y0 = yR + Math.round(rnd() * s(6)), wb = o.wallTo != null ? o.wallTo : y0 + s(12);
      L.rect(x + s(3), y0, hw - s(6), wb - y0, wall, (xx, yy) => (((Math.round(xx - x) % s(11)) < 1 || ((Math.round(yy - y0) % s(14)) === s(10))) ? 0.12 : xx < x + s(6) ? 0.55 : 0.42));
      L.poly([[x - s(3), y0 + s(2)], [x + s(6), y0 - rh], [x + hw - s(6), y0 - rh], [x + hw + s(3), y0 + s(2)]], M, (xx, yy) => clamp(0.85 - (yy - (y0 - rh)) / rh * 0.4 - (xx - x) / hw * 0.25 - (o.night ? 0.35 : 0), 0, 0.999));
      if (rnd() < 0.7) wins.push([x + Math.round(hw * (0.3 + rnd() * 0.4)), y0 + s(4)]);
      x += hw + s(2);
    }
    return wins;
  }
  function windows(g, wins, s, a) { for (const [x, y] of wins) { g.fillStyle = 'rgba(255,190,110,' + a + ')'; g.fillRect(x, y, s(5), s(4)); R(g, x + Math.round(s(5) / 2), y, 1, s(4), 'rgba(60,30,20,0.6)'); } }

  // ---- the stage -----------------------------------------------------------------------------------------------
  const BUNT = ['#c8603a', '#e0b050', '#6a8a5a', '#d8d0bc', '#8a4a5a'];
  // a raised wooden deck on posts; behind it two tall posts and the crossbeam for the lanterns; three steps at
  // the front; a ladder against the right post; a pile of bunting not yet hung at the left end
  function stageSet(L, o) {
    const p = P(), { cx, yD, hw, s, depth, beam, night } = o;
    const wood = p.mat(night ? '#5a4030' : '#7a5638', { n: 6, at: 3, step: 0.085 }), dark = p.mat('#4e3624', { n: 5, at: 2, step: 0.08 });
    const top = yD - depth, front = s(16);
    const px0 = cx - hw + s(10), px1 = cx + hw - s(14), pw = Math.max(2, s(4));
    for (const x of [px0, px1]) L.rect(x, beam, pw, top - beam + s(2), wood, (xx) => (xx < x + pw * 0.45 ? 0.85 : 0.4));
    L.rect(px0 - s(8), beam - s(4), px1 - px0 + pw + s(16), s(4), wood, (xx, yy) => (yy < beam - s(3) ? 0.9 : 0.45));
    L.poly([[cx - hw, yD], [cx - hw + s(8), top], [cx + hw - s(8), top], [cx + hw, yD]], wood, (x, y) => ((Math.round(y) % Math.max(2, s(3))) === 0 ? 0.42 : clamp(0.8 - (x - cx + hw) / (hw * 2) * 0.24 - (night ? 0.25 : 0), 0, 0.999)));
    L.rect(cx - hw, yD, hw * 2, front, dark, (x, y) => ((Math.round(x - cx) % s(18)) < 1 ? 0.1 : y < yD + 1 ? 0.7 : 0.32));
    for (let i = 0; i < 3; i++) L.rect(cx - Math.round(hw * 0.62) + i * s(2), yD + front - (i + 1) * Math.round(front / 3), s(24) - i * s(4), Math.round(front / 3), wood, 0.66 - i * 0.12);
    const lx = px1 + s(4), ly0 = beam + s(4), ly1 = top + s(2);
    L.seg(lx, ly1, lx + s(5), ly0, Math.max(1, s(1.6)), wood, 0.7); L.seg(lx + s(8), ly1, lx + s(12), ly0, Math.max(1, s(1.6)), wood, 0.45);
    for (let y = ly1 - s(6); y > ly0 + s(2); y -= s(7)) { const f = (ly1 - y) / (ly1 - ly0); L.line(lx + f * s(5), y, lx + s(8) + f * s(4), y, wood, 4); }
    for (let i = 0; i < 9; i++) L.ell(cx - hw + s(18) + (i % 3) * s(3), top - Math.floor(i / 3) * s(2), s(3), s(2), p.mat(BUNT[i % 5], { n: 4, at: 2 }), 0.6);
    return { px0, px1, pw, top, front };
  }
  function bunting(g, x0, y0, x1, y1, sag, s, n) {
    const pt = (u) => [Math.round(lerp(x0, x1, u)), Math.round(lerp(y0, y1, u) + Math.sin(Math.PI * u) * sag)];
    g.strokeStyle = '#3a2a22'; g.lineWidth = 1; g.beginPath();
    for (let i = 0; i <= 24; i++) { const [x, y] = pt(i / 24); if (i) g.lineTo(x + 0.5, y + 0.5); else g.moveTo(x + 0.5, y + 0.5); }
    g.stroke();
    const fw = Math.max(2, s(4)), fh = Math.max(3, s(6));
    for (let i = 0; i < n; i++) {
      const [x, y] = pt((i + 0.5) / n);
      g.fillStyle = BUNT[i % 5]; g.beginPath(); g.moveTo(x - fw / 2, y); g.lineTo(x + fw / 2, y); g.lineTo(x, y + fh); g.closePath(); g.fill();
    }
  }
  // the paper lanterns hanging from the crossbeam; `lit` 0..n (fractional: the next one catching)
  function lanterns(c, xs, y, s, lit, t, still, big) {
    const R0 = Math.max(3, Math.round(s(5) * (big || 1))), H0 = Math.max(6, Math.round(s(11) * (big || 1)));
    const dk = Q.small('ch3.lan|' + R0 + '|0', () => Q.chochin(R0, H0, false)), on = Q.small('ch3.lan|' + R0 + '|1', () => Q.chochin(R0, H0, true));
    xs.forEach((x, i) => {
      const a = clamp(lit - i, 0, 1);
      R(c, x, y - s(3), 1, s(3), '#2a1e18');
      c.drawImage(dk.cv, Math.round(x - dk.cx), y);
      if (a > 0) {
        const fl = still ? 0.9 : 0.86 + 0.08 * Math.sin(t / 310 + i * 1.7);
        c.globalAlpha = step4(a) * fl; P().halo(c, x, y + Math.round(on.H / 2), Math.round(R0 * 3.6), '255,190,110', 0.24, 3);
        c.globalAlpha = step4(a); c.drawImage(on.cv, Math.round(x - on.cx), y); c.globalAlpha = 1;
      }
    });
    return { H: dk.H, R0 };
  }

  // ---- the people of the square (map co.eve) -------------------------------------------------------------------
  // [id, x, y] where the map stands them; Suzu is among them only when she is not your companion
  const CROWD = [
    ['co_shino', 16, 16], ['co_ume', 18, 16], ['co_sayo', 21, 16], ['hiro', 27, 16], ['co_isao', 28, 16], ['co_tamotsu', 30, 16],
    ['co_goro', 16, 18], ['co_asa', 29, 18], ['co_fusa', 18, 19], ['co_kotaro', 20, 19], ['co_heita', 22, 19], ['co_nobu', 29, 19],
    ['suzu', 25, 20],
  ];
  const suzuHere = (st) => !(st.cast.comp && st.cast.comp.id === 'suzu');

  // ==== ch3.assembly · dusk / night: from behind the crowd ==================================================
  // the square in perspective from the south: map row my at screen y Y(my), scale Sc(my); column mx at X(mx, my)
  function geomSq(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow', land = lay === 'land';
    const yH = Math.round(vb * (narrow ? 0.3 : 0.36));
    const yD = Math.round(vb * (narrow ? 0.5 : land ? 0.86 : 0.54));        // the stage deck's front edge
    const depth = s(10), hw = Math.round(clamp(w * (narrow ? 0.4 : 0.2), s(96), s(136)));
    const yG = yD + s(16);                                                      // the ground at the stage's foot
    const yF = land ? vb + s(120) : Math.round(vb + s(narrow ? 40 : 34));       // the nearest row (21)
    const cx = Math.round(w / 2);
    const u = (my) => clamp((my - 14) / 7, 0, 1);
    const Y = (my) => Math.round(lerp(yG + s(4), yF, Math.pow(u(my), 1.2)));
    const Sc = (my) => lerp(0.62, narrow ? 1 : 1.05, u(my)) * clamp(S.Z, 0.5, 1.15);
    const X = (mx, my) => Math.round(cx + (mx - 23) * lerp(s(narrow ? 10 : 13), s(narrow ? 16 : 22), u(my)));
    const beam = Math.round(yD - depth - s(58));
    return Object.assign(S, { yH, yD, depth, hw, yG, yF, cx, u, Y, Sc, X, beam });
  }
  function squareStatic(G, night) {
    return cached('ch3.sq|' + (night ? 'n' : 'd') + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yH, yD, yG, cx, hw, depth, beam } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(3301);
      sky(g, w, yH + s(4), s, rnd, night);
      const L = p.layer(w, h);
      const hl = hills(L, w, yH, s, rnd, { night });
      // Gorō's fire lookout at the corner of the square (our left), dark against the sky
      const tx = Math.round(cx - hw - s(40)), tb = yG - s(18), tt = Math.round(Math.max(s(4), beam - s(30)));
      if (tx > s(8)) lookout(L, tx, tt, tb, s(14), s, night, false);
      const wins = roofs(L, w, yG - s(30), s, rnd, { night, wallTo: yG - s(10) });
      const earth = p.mat(night ? '#3a3036' : '#7a6450', { n: 6, at: 3, step: 0.07 });
      L.rect(0, yG - s(12), w, h - yG + s(12), earth, (x, y) => clamp(0.55 - Math.abs(x - cx) / w * 0.3 + (p.bayer(x, y) - 0.5) * 0.16 + (((x * 7 + y * 13) % 23) === 0 ? 0.1 : 0) - (y < yG - s(6) ? 0.15 : 0), 0, 0.999));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      if (!night) fruit(g, w, yH, s, hl.top, rnd);
      windows(g, wins, s, night ? 0.85 : 0.45);
      const SL = p.layer(w, h);
      const ss = stageSet(SL, { cx, yD, hw, s, depth, beam, night });
      SL.outline();
      g.drawImage(SL.canvas(), 0, 0);
      bunting(g, ss.px0 + 2, beam + s(1), ss.px1, beam + s(1), s(7), s, 14);
      bunting(g, ss.px0 + 2, beam + s(8), cx - Math.round(hw * 0.25), ss.top - s(4), s(8), s, 6); // the half-hung string
      const bench = p.mat(night ? '#3a2c26' : '#6e4a2e', { n: 5, at: 2 }), B = p.layer(w, h);
      for (const [mx, my] of [[17, 17], [20, 17], [17, 20], [20, 20]]) { const x = G.X(mx, my), y = G.Y(my) - s(2), bw = Math.round(G.Sc(my) * s(26)); B.rect(x - bw / 2, y - Math.round(bw * 0.3), bw, Math.max(1, Math.round(bw * 0.12)), bench, 0.8); B.rect(x - bw / 2 + 1, y - Math.round(bw * 0.2), 1, Math.round(bw * 0.2), bench, 0.3); B.rect(x + bw / 2 - 2, y - Math.round(bw * 0.2), 1, Math.round(bw * 0.2), bench, 0.3); }
      B.outline();
      g.drawImage(B.canvas(), 0, 0);
      return { cv, ss, wins };
    });
  }
  // Gorō's fire lookout: four legs braced, a platform and a little roof (the bell under it)
  function lookout(L, x, top, base, hw, s, night) {
    const p = P(), wood = p.mat(night ? '#3a2c24' : '#5e4430', { n: 5, at: 2, step: 0.08 }), roof = p.mat(night ? '#2a2a34' : '#4a4652', { n: 4, at: 2 });
    const plat = top + Math.round((base - top) * 0.24);
    L.seg(x - hw, base, x - Math.round(hw * 0.6), plat, Math.max(1, s(2)), wood, 0.7);
    L.seg(x + hw, base, x + Math.round(hw * 0.6), plat, Math.max(1, s(2)), wood, 0.35);
    for (let y = plat + s(8); y < base - s(6); y += s(14)) { const f = (y - plat) / (base - plat), a = lerp(hw * 0.6, hw, f); L.line(x - a, y, x + a, y + s(9), wood, 1); L.line(x + a, y, x - a, y + s(9), wood, 1); }
    L.rect(x - Math.round(hw * 0.8), plat - s(2), Math.round(hw * 1.6), s(3), wood, 0.8);
    L.rect(x - Math.round(hw * 0.7), plat - s(9), 1, s(7), wood, 0.6); L.rect(x + Math.round(hw * 0.7), plat - s(9), 1, s(7), wood, 0.4);
    L.poly([[x - hw, plat - s(9)], [x, plat - s(18)], [x + hw, plat - s(9)]], roof, (xx) => (xx < x ? 0.8 : 0.4));
    L.ell(x, plat - s(6), Math.max(1, s(2)), Math.max(1, s(2)), p.mat('#7a6a3a', { n: 4, at: 2 }), 0.7);
    return { plat };
  }
  // who turns to whom in the murmur
  const TURN = { co_ume: 'right', co_sayo: 'left', hiro: 'right', co_isao: 'left', co_fusa: 'right', co_kotaro: 'left', co_asa: 'left', co_nobu: 'left', co_shino: 'right' };
  // after dark: people holding one another (facing each other where the map puts two side by side)
  const NIGHT_POSE = {
    co_shino: ['right', 'p:reach'], co_ume: ['left', 'p:low'], co_sayo: ['up', 'p:heart'], hiro: ['right', 'p:reach'], co_isao: ['left', 'p:low'],
    co_tamotsu: ['up', 'p:folded'], co_goro: ['up', 'p:low'], co_asa: ['up', 'p:heart'], co_fusa: ['right', 'p:low'], co_kotaro: ['left', 'p:reach'],
    co_heita: ['up', 'p:low'], co_nobu: ['up', 'p:lowface'], suzu: ['up', 'p:clasp'],
  };
  const COMP_NIGHT = { nao: 'p:strap', mio: 'p:heart', ren: 'p:clasp~u', suzu: 'p:behind' };
  function drawSquare(c, w, h, t, st, night) {
    const G = geomSq(w, h, st.vb), { s, cx, yD, depth } = G, still = st.still;
    const S0 = squareStatic(G, night);
    c.drawImage(S0.cv, 0, 0);
    // the lanterns on the crossbeam: dark at dusk; after dark lit (all five when the names were read)
    const xs = [];
    for (let i = 0; i < 5; i++) xs.push(Math.round(lerp(S0.ss.px0 + s(16), S0.ss.px1 - s(12), i / 4)));
    lanterns(c, xs, G.beam + s(3), s, night ? (st.test('co_asm_names') ? 5 : 2) : 0, t, still);
    if (night) {
      c.fillStyle = 'rgba(255,190,110,0.1)'; c.fillRect(cx - G.hw, S0.ss.top, G.hw * 2, depth);
      for (const [x, y] of S0.wins) { c.fillStyle = 'rgba(255,190,110,0.12)'; P().disc(c, x + s(2), y + s(2), s(6), s(4)); }
    }
    // Tokiwa on the stage with the chronicle
    put(c, fig(look('co_tokiwa'), 'down', 'p:hold/book', G.Sc(14.4), night ? LAMP : DUSK_L), cx, yD - Math.round(depth * 0.4));
    const km = st.at('murmur'), kf = st.at('fire'), kc = st.at('comp');
    const people = CROWD.filter((c0) => c0[0] !== 'suzu' || suzuHere(st)).map((p) => ({ id: p[0], mx: p[1], my: p[2], lk: look(p[0]) }));
    people.push({ id: 'pc', mx: 23, my: 17, lk: st.cast.pc });
    if (st.cast.comp) people.push({ id: 'comp', mx: 24.1, my: 17.4, lk: st.cast.comp.look, cid: st.cast.comp.id });
    people.sort((a, b) => a.my - b.my);
    for (const pp of people) {
      const x = G.X(pp.mx, pp.my), y = G.Y(pp.my), sc = G.Sc(pp.my);
      let dir = 'up', key = 'i0';
      if (night) {
        const np = NIGHT_POSE[pp.id];
        if (np) { dir = np[0]; key = np[1]; }
        if (pp.id === 'comp' && kc > 0.2) key = COMP_NIGHT[pp.cid] || 'p:low';
      } else {
        const turn = TURN[pp.id], j = ((pp.mx * 7 + pp.my * 3) % 10) / 10;
        if (turn && km > 0.15 + j * 0.5) dir = turn;
        if (pp.id === 'co_asa' && km > 0) { dir = 'left'; key = km > 0.3 && km < 0.7 ? 'p:laugh' : km >= 0.7 ? 'p:stiff' : 'i0'; }
        if (pp.id === 'co_sayo' && kf > 0.1) { dir = 'up'; key = kf < 0.5 ? 'p:recoil' : 'p:heart'; }
      }
      shadow(c, x, y, s(8) * sc, night ? 0.4 : 0.3);
      put(c, fig(pp.lk, dir, key, sc, night ? LAMP : pp.my < 17 ? DUSK_FAR : DUSK_L), x, y);
    }
    if (!still) Q.dust(c, 0, G.yH, w, G.vb, s(20), t, night ? 10 : 6, night ? '255,200,140' : '255,220,190', still, 41);
  }
  const focusSq = (w, h, vb) => { const G = geomSq(w, h, vb); return { x: G.cx - G.hw, y: Math.max(0, G.beam - G.s(6)), w: G.hw * 2, h: G.yD - G.beam + G.s(10) }; };
  const dusk = {
    phases: [['dusk', 0], ['murmur', 1200], ['fire', 700]],
    safe: { wide: 'the stage and Tokiwa top-centre, the crowd below', narrow: 'the stage in the top half, the crowd below it', land: 'the stage and Tokiwa' },
    draw(c, w, h, t, st) { drawSquare(c, w, h, t, st, false); },
    focus: focusSq,
  };
  const night = {
    phases: [['night', 0], ['comp', 900]],
    safe: { wide: 'the lit stage and the square above the sheet', narrow: 'the stage and the square in the upper half', land: 'the lit stage' },
    draw(c, w, h, t, st) { drawSquare(c, w, h, t, st, true); },
    focus: focusSq,
  };

  // ==== the backdrop behind Tokiwa, seen from below the stage (confess, names) ===============================
  // the dusk sky, the hill, the roofs beyond the square (their walls down to the deck), the crossbeam and its
  // posts close, a bunting string across
  function backStatic(G, key, o) {
    return cached('ch3.back|' + key + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(o.seed || 77);
      const yH = Math.round(o.yH), deck = Math.round(o.deck);
      sky(g, w, yH + s(6), s, rnd, false);
      const L = p.layer(w, h);
      const hl = hills(L, w, yH, s, rnd, { rise: 30 });
      const wins = roofs(L, w, Math.round(o.roof), s, rnd, { wallTo: deck });
      const wood = p.mat('#7a5638', { n: 6, at: 3, step: 0.085 });
      const bx0 = Math.round(o.bx0), bx1 = Math.round(o.bx1), by = Math.round(o.beam), pw = s(7);
      L.rect(bx0, by, pw, deck - by, wood, (xx) => (xx < bx0 + pw * 0.4 ? 0.85 : 0.4));
      L.rect(bx1, by, pw, deck - by, wood, (xx) => (xx < bx1 + pw * 0.4 ? 0.75 : 0.35));
      L.rect(bx0 - s(12), by - s(7), bx1 - bx0 + pw + s(24), s(7), wood, (xx, yy) => (yy < by - s(6) ? 0.92 : 0.45));
      // the deck's front edge from below: a dark fascia, the planks' ends
      L.rect(0, deck, w, h - deck, p.mat('#4e3624', { n: 5, at: 2 }), (x, y) => ((Math.round(x) % s(12)) < 1 ? 0.12 : y < deck + 1 ? 0.75 : 0.36));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      fruit(g, w, yH, s, hl.top, rnd);
      windows(g, wins, s, 0.5);
      bunting(g, bx0 + pw, by + s(2), bx1, by + s(2), s(14), s, 12);
      return { cv, bx0, bx1, by };
    });
  }
  // fingers curled over an edge (a hand holding a book or a board): n fingertips side by side hanging over the
  // edge at (x, y), and the thumb's tip on the near side; side ±1 puts the thumb left or right
  function fingers(c, x, y, k, sk, n, side) {
    const fw = Math.max(2, Math.round(2.2 * k)), fl = Math.max(3, Math.round(4.2 * k));
    for (let i = 0; i < n; i++) {
      const fx = Math.round(x + i * (fw + 1)), fy = Math.round(y - 1 + (i === 0 || i === n - 1 ? 1 : 0));
      R(c, fx, fy - 1, fw, fl, sk[1]); R(c, fx, fy - 1, fw - 1, fl - 1, sk[0]);
      R(c, fx, fy - 2, fw, 1, 'rgba(60,30,20,0.55)');
      R(c, fx + fw - 1, fy, 1, fl - 1, 'rgba(60,30,20,0.35)');
    }
    const tx = side > 0 ? Math.round(x - fw - 1) : Math.round(x + n * (fw + 1));
    R(c, tx, Math.round(y + 1), fw, Math.round(fl * 0.8), sk[1]); R(c, tx, Math.round(y + 1), fw - 1, 1, sk[0]);
  }
  // the village chronicle: a thick stitched book in a faded indigo cover (closed); or open at two pages of marks
  function chronicle(c, x, y, k, ang) {
    const W = Math.round(30 * k), H = Math.round(38 * k);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(ang || 0);
    R(c, -W / 2 + Math.round(2 * k), -H / 2 + Math.round(2 * k), W, H, 'rgba(20,12,16,0.35)');
    R(c, -W / 2, -H / 2, W, H, '#33405a'); R(c, -W / 2, -H / 2, W, 1, '#4e5e7c'); R(c, -W / 2, H / 2 - 1, W, 1, '#1e2636'); R(c, -W / 2, -H / 2, 1, H, '#46567a');
    R(c, W / 2 - Math.round(3 * k), -H / 2 + 1, Math.round(3 * k), H - 2, '#e8dcc0'); R(c, W / 2 - 1, -H / 2 + 1, 1, H - 2, '#c8b898');
    for (let i = 0; i < 4; i++) R(c, -W / 2 + 1, Math.round(-H / 2 + (6 + i * 9) * k), Math.max(1, Math.round(2 * k)), 1, '#c8b890');
    R(c, -W / 2 + Math.round(9 * k), -H / 2 + Math.round(5 * k), Math.round(9 * k), Math.round(17 * k), '#ddd2b6'); // the title slip (blank)
    c.restore();
    return { W, H };
  }
  function geomConf(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    // (an upright phone: higher in the tall frame, the backdrop rising with him)
    const tx = Math.round(w * (lay === 'narrow' ? 0.48 : 0.44)), ty = lay === 'narrow' ? Math.round(vb - s(150)) : Math.max(Math.round(vb - s(16)), 98);
    return Object.assign(S, { tx, ty });
  }
  const confess = {
    phases: [['lower', 800], ['ask', 900]],
    safe: { wide: 'Tokiwa\'s face in the top half', narrow: 'Tokiwa\'s face in the top half', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomConf(w, h, st.vb), { s, tx, ty } = G, still = st.still;
      const B = backStatic(G, 'conf', { yH: ty - s(66), roof: ty - s(34), deck: ty + s(24), bx0: tx - s(170), bx1: tx + s(150), beam: Math.max(s(8), ty - 96 - s(30)), seed: 19 });
      c.drawImage(B.cv, 0, 0);
      const xs = [B.bx0 + s(40), B.bx0 + s(110), B.bx1 - s(30)];
      lanterns(c, xs, B.by + s(4), s, 0, t, still, 1.5);
      const kl = st.at('lower'), ka = st.at('ask');
      const down = Math.round(ease(kl) * 2 * (1 - ease(ka)));
      const expr = ka > 0.3 ? 'neutral' : kl > 0.2 ? 'worry' : 'neutral';
      const fr = down ? { head: [0, down], look: [0, 1] } : ka > 0.3 ? null : { look: [0, 1] };
      const tb = Q.bust('co_tokiwa', expr, fr, FACE_L, false, 200);
      if (tb) c.drawImage(tb.cv, tx - tb.ax, ty - tb.ay);
      // the chronicle held to his chest in both hands (his fingers over its top edge)
      const bx = tx + 2, by = ty - s(6) + down;
      const bk = chronicle(c, bx, by, 1.2, 0);
      fingers(c, bx - Math.round(bk.W * 0.38), by - Math.round(bk.H / 2), 1.2, skin('co_tokiwa'), 4, 1);
      fingers(c, bx + Math.round(bk.W * 0.16), by - Math.round(bk.H / 2), 1.2, skin('co_tokiwa'), 4, -1);
      // Tamotsu below the stage, from behind, his hat at the lower right
      const tb2 = Q.back(look('co_tamotsu'), Math.round(clamp(s(120), 80, 160)), { light: 'l' });
      if (tb2) c.drawImage(tb2.cv, Math.round(Math.min(w - s(20), tx + s(190)) - tb2.ax), Math.round(G.vb + s(64) - tb2.ay));
      if (!still) Q.dust(c, 0, 0, w, G.vb, s(10), t, 8, '255,220,190', still, 7);
    },
    focus(w, h, vb) { const G = geomConf(w, h, vb); return { x: G.tx - 32, y: G.ty - 90, w: 64, h: 58 }; },
  };

  // ==== the reverse: the square seen from the stage (voices, living, hands) ===================================
  // a little above the square: the far side's roofs and the dark hill, the crowd facing us. Arranged for the
  // picture (those who speak have stepped to the front); you and your companion at the left, the east side,
  // where the dusk shot has you (it is that view turned round)
  function geomRev(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow';
    const yH = Math.round(vb * (narrow ? 0.2 : 0.22));
    const y0 = Math.round(vb * (narrow ? 0.4 : 0.47)), y1 = Math.round(vb - s(narrow ? 8 : 2));
    const cx = Math.round(w * (narrow ? 0.5 : 0.44));
    const row = (r) => Math.round(lerp(y0, y1, r));                                     // r: 0 far … 1 the front
    const sc = (r) => lerp(0.58, narrow ? 0.95 : 1.05, r) * clamp(S.Z, 0.5, 1.15);
    const col = (u, r) => Math.round(cx + u * lerp(s(narrow ? 110 : 170), s(narrow ? 160 : 230), r)); // u: −1 … 1
    return Object.assign(S, { yH, y0, y1, cx, row, sc, col });
  }
  function revStatic(G) {
    return cached('ch3.rev|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yH, y0 } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(5150);
      // looking south-east: a darker violet sky with the first stars; the afterglow low at the right (west)
      Q.bandsIn(g, 0, 0, w, yH + s(4), ['#1e2048', '#28285a', '#342e62', '#463664', '#5e3e64', '#7a4660'], 0.45);
      for (let i = 0; i < 18; i++) R(g, Math.round(rnd() * w), Math.round(rnd() * yH * 0.7), 1, 1, 'rgba(232,230,255,0.6)');
      const L = p.layer(w, h);
      hills(L, w, yH + s(10), s, rnd, { col: '#3a3436', cx: w * 0.75, rise: 18, step: 6, trees: 14 });
      const wins = roofs(L, w, y0 - s(28), s, rnd, { wallTo: y0 - s(10) });
      const earth = p.mat('#6e5a4a', { n: 6, at: 3, step: 0.07 });
      // (the light falls off toward the east; an ordered dither keeps the steps from making seams)
      L.rect(0, y0 - s(12), w, h - y0 + s(12), earth, (x, y) => clamp(0.48 + (x / w) * 0.12 + (p.bayer(x, y) - 0.5) * 0.16 + (((x * 5 + y * 11) % 29) === 0 ? 0.1 : 0) - (y < y0 - s(8) ? 0.12 : 0), 0, 0.999));
      // the well at the far side
      const stone = p.mat('#7a7470', { n: 5, at: 2 }), wood = p.mat('#6e4a2e', { n: 5, at: 2 });
      const wx = Math.round(w * 0.86), wy = y0 - s(4);
      L.ell(wx, wy, s(11), s(4), stone, (x, y) => (y < wy ? 0.8 : 0.45)); L.rect(wx - s(11), wy, s(22), s(7), stone, (x) => (x < wx ? 0.7 : 0.4));
      L.rect(wx - s(9), wy - s(16), s(2), s(16), wood, 0.6); L.rect(wx + s(7), wy - s(16), s(2), s(16), wood, 0.4); L.rect(wx - s(11), wy - s(18), s(22), s(3), wood, 0.8);
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      windows(g, wins, s, 0.5);
      return { cv };
    });
  }
  // [id, u (−1 left … 1 right), r (0 far … 1 front)]
  const REV = [
    ['co_shino', 0.66, 0.04], ['hiro', -0.5, 0.0], ['co_isao', -0.64, 0.06], ['co_asa', -0.82, 0.16], ['co_tamotsu', 0.9, 0.1],
    ['co_sayo', 0.18, 0.1], ['co_kotaro', 0.34, 0.28], ['co_heita', 0.02, 0.3], ['suzu', -0.24, 0.2],
    ['co_nobu', -0.34, 0.74], ['co_fusa', 0.1, 0.86], ['co_ume', 0.4, 0.8], ['co_goro', 0.68, 0.72],
  ];
  const SPEAK = { co_fusa: ['fusa', 'p:heart', 'p:clasp'], co_nobu: ['nobu', 'p:emph1', 'p:folded'], co_ume: ['ume', 'p:clasp', 'p:clasp'], co_goro: ['goro', 'p:raise', 'p:hip'] };
  const PAIR_AT = [-0.2, 0.5];
  function crowdRev(c, G, st, o) {
    o = o || {};
    const { s } = G, ke = st.at('eyes'), kb = st.at('bell');
    const list = REV.filter((r) => (r[0] !== 'suzu' || suzuHere(st)) && !(o.skip && o.skip.includes(r[0]))).map((r) => ({ id: r[0], u: r[1], r: r[2], lk: look(r[0]) }));
    list.push({ id: 'pc', u: PAIR_AT[0], r: PAIR_AT[1], lk: st.cast.pc });
    if (st.cast.comp) list.push({ id: 'comp', u: PAIR_AT[0] + 0.14, r: PAIR_AT[1] - 0.04, lk: st.cast.comp.look });
    list.sort((a, b) => a.r - b.r);
    const pcx = G.col(PAIR_AT[0] + 0.07, PAIR_AT[1]);
    list.forEach((p, i) => {
      let x = G.col(p.u, p.r), y = G.row(p.r);
      const sc = G.sc(p.r);
      let dir = 'down', key = 'i0';
      if (o.pose) { const r = o.pose(p, i); if (r) { dir = r[0]; key = r[1]; } }
      else {
        const sp = SPEAK[p.id];
        if (sp) {
          const k = st.at(sp[0]), cur = st.phase === sp[0] || (p.id === 'co_goro' && st.phase === 'bell');
          if (k > 0 && cur) { key = k < 0.35 ? 'p:listen' : sp[1]; if (p.id === 'co_goro' && st.phase === 'bell' && kb > 0.3) key = 'p:palmout'; y += Math.round(ease(Math.min(1, k * 2)) * s(3)); }
          else if (k >= 1) key = sp[2];
        }
        // every face turns to the travellers, a wave outward from them
        if (p.id !== 'pc' && p.id !== 'comp' && ke > 0) {
          const d = Math.abs(x - pcx) / G.w;
          if (ke > 0.08 + d * 0.9) { dir = x > pcx ? 'left' : 'right'; if (key === 'p:listen') key = 'i0'; }
        }
      }
      shadow(c, x, y, s(9) * sc, 0.32);
      put(c, fig(p.lk, dir, key, sc, p.r < 0.4 ? DUSK_FAR : DUSK_R), x, y);
    });
  }
  const voices = {
    phases: [['fusa', 600], ['nobu', 600], ['ume', 600], ['goro', 700], ['bell', 700], ['eyes', 1300]],
    safe: { wide: 'the four faces in the top 55 %', narrow: 'two rows above the sheet', land: 'the front row\'s faces' },
    draw(c, w, h, t, st) {
      const G = geomRev(w, h, st.vb), { s } = G, still = st.still;
      c.drawImage(revStatic(G).cv, 0, 0);
      crowdRev(c, G, st);
      // Tokiwa from behind at the right edge, close: the high collar of his robe, the arm of his glasses
      const tb = Q.back(look('co_tokiwa'), Math.round(clamp(s(170), 120, 230)), { light: 'r' });
      if (tb) c.drawImage(tb.cv, Math.round(w - s(G.lay === 'narrow' ? 40 : 70) - tb.ax), Math.round(G.vb + s(70) - tb.ay));
      if (!still) Q.dust(c, 0, G.y0 - s(40), w, G.vb, -s(10), t, 8, '255,214,180', still, 9);
    },
    focus(w, h, vb) { const G = geomRev(w, h, vb), y = G.row(0.72) - Math.round(58 * G.sc(0.8)); return { x: G.col(-0.42, 0.75) - 12, y, w: G.col(0.76, 0.75) - G.col(-0.42, 0.75) + 24, h: Math.round(G.row(0.86) - y - 30 * G.sc(0.86)) }; },
  };

  // ==== names: close on Tokiwa reading, a lantern lit for each name; Gorō below ===============================
  function geomNames(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow';
    const gy = Math.max(Math.round(vb + s(10)), 98), gx = Math.round(w * (narrow ? 0.3 : 0.2));
    const ty = narrow ? Math.round(vb - s(130)) : Math.max(Math.round(vb - s(46)), 98), tx = Math.round(w * (narrow ? 0.62 : 0.56));
    return Object.assign(S, { gx, gy, tx, ty });
  }
  const names = {
    phases: [['names', 1500], ['goro', 800]],
    safe: { wide: 'Tokiwa\'s face top centre-right, Gorō\'s lower left, the lanterns above', narrow: 'the lanterns, Tokiwa, Gorō stacked', land: 'Tokiwa\'s face (and Gorō\'s beside it)' },
    draw(c, w, h, t, st) {
      const G = geomNames(w, h, st.vb), { s, tx, ty, gx, gy } = G, still = st.still;
      const B = backStatic(G, 'names', { yH: ty - s(50), roof: ty - s(20), deck: ty + s(26), bx0: s(16), bx1: w - s(30), beam: Math.max(s(6), ty - 96 - s(24)), seed: 23 });
      c.drawImage(B.cv, 0, 0);
      // five lanterns along the beam, one lit for each name as it is read
      const kn = st.at('names'), xs = [];
      for (let i = 0; i < 5; i++) xs.push(Math.round(lerp(B.bx0 + s(36), B.bx1 - s(26), i / 4)));
      lanterns(c, xs, B.by + s(4), s, kn * 5, t, still, 1.6);
      const tb = Q.bust('co_tokiwa', 'think2', { look: [0, 1], head: [0, 1] }, FACE_L, false, 200);
      if (tb) c.drawImage(tb.cv, tx - tb.ax, ty - tb.ay);
      // the chronicle open in his hands, low at the frame's edge
      const k = 1.1, bx = tx + s(2), by = ty - s(2);
      const ob = openBook(c, bx, by, k, s, 'rgba(255,220,160,0.12)');
      // his thumbs on the pages' lower corners, the fingers under the book; the sleeves at its sides
      const sk = skin('co_tokiwa');
      for (const sx of [-1, 1]) {
        const ex = bx + sx * (ob.W - 3), ey = by + Math.round(ob.H / 2) - 6;
        R(c, sx < 0 ? ex - 1 : ex - 2, ey, 3, 5, sk[1]); R(c, sx < 0 ? ex - 1 : ex - 2, ey, 2, 4, sk[0]);
        R(c, sx < 0 ? bx - ob.W - 5 : bx + ob.W, by - 2, 5, Math.round(ob.H / 2) + 6, sleeve('co_tokiwa'));
      }
      // Gorō in the crowd below, looking up at the stage; at "Mitsu" his head lowers
      const kg = st.at('goro');
      const gb = Q.bust('co_goro', kg > 0.3 ? 'sad2' : 'neutral', kg > 0.3 ? { head: [0, 2] } : { look: [1, -1], head: [0, -1] }, FACE_L, false, 200);
      if (gb) c.drawImage(gb.cv, gx - gb.ax, gy - gb.ay);
    },
    focus(w, h, vb) { const G = geomNames(w, h, vb); return { x: G.tx - 34, y: G.ty - 90, w: 68, h: 58 }; },
  };
  // an open book (the chronicle) seen from above at a slant: two pages of columns of marks (writing texture)
  function openBook(c, x, y, k, s, glow) {
    const W = Math.round(34 * k), H = Math.round(22 * k);
    R(c, x - W - 1, y - H / 2 + 2, W * 2 + 2, H, 'rgba(20,12,16,0.4)');
    R(c, x - W, y - H / 2, W * 2, H, '#e8dcc0'); R(c, x - W, y - H / 2, W * 2, 1, '#f6eedc'); R(c, x - 1, y - H / 2, 2, H, '#b8a888');
    c.fillStyle = 'rgba(70,58,66,0.6)';
    for (let col = 0; col < 12; col++) { const cx0 = x - W + Math.round((3 + col * 5.5) * k); if (Math.abs(cx0 - x) < 3) continue; for (let yy = y - H / 2 + 3; yy < y + H / 2 - 3; yy += 2) if (((col * 7 + yy) | 0) % 5) c.fillRect(cx0, yy, 1, 1); }
    if (glow) { c.fillStyle = glow; c.fillRect(x - W, y - H / 2, W * 2, H); }
    return { W, H };
  }

  // ==== living: Heita and his sickle ===========================================================================
  function geomLiving(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const hx = Math.round(w * (lay === 'narrow' ? 0.4 : 0.36)), hy = lay === 'narrow' ? Math.round(vb - s(90)) : Math.max(Math.round(vb + s(8)), 98);
    return Object.assign(S, { hx, hy });
  }
  // a sickle in a fist: the wooden handle, the steel's inner edge catching the light
  function sickle(c, x, y, k, ang, sk, sl) {
    const key = 'ch3.sickle|' + k + '|' + ang.toFixed(2) + '|' + sk.join(',') + '|' + sl;
    const sp = Q.small(key, () => {
      const p = P(), S = Math.round(70 * k), L = p.layer(S, S), cx = S / 2, cy = S / 2;
      const wood = p.mat('#8a6038', { n: 5, at: 3, step: 0.09 }), steel = p.mat('#9aa2ae', { n: 6, at: 3, step: 0.09 });
      L.translate(cx, cy); L.rotate(ang);
      // the handle, then the crescent blade off its top, curving out and down (its sharpened inner edge lit)
      L.seg(0, Math.round(6 * k), 0, -Math.round(20 * k), Math.max(2, 3 * k), wood, (xx) => (xx < 0 ? 0.85 : 0.4));
      const r1 = 13 * k, r0 = 10 * k, ox = -r1 + 1, oy = -20 * k;
      L.fill(ox - r1, oy - r1, ox + r1, oy + r1, (xx, yy) => { const d = Math.hypot(xx - ox, (yy - oy) * 1.15); const a = Math.atan2(yy - oy, xx - ox); return d <= r1 && d >= r0 && a < -0.05 && a > -Math.PI * 0.95; }, steel, (xx, yy) => (Math.hypot(xx - ox, (yy - oy) * 1.15) < r0 + 1.4 ? 0.95 : 0.45));
      L.rect(-Math.max(2, 2 * k), -Math.round(21 * k), Math.max(3, 4 * k), Math.max(2, 2 * k), p.mat('#5a5a62', { n: 3, at: 1 }), 1); // the collar
      L.outline();
      return { cv: L.canvas(), ax: Math.round(cx), ay: Math.round(cy) };
    });
    c.drawImage(sp.cv, Math.round(x - sp.ax), Math.round(y - sp.ay));
    const hd = Q.hand({ size: Math.round(9 * k), pose: 'grip', side: 'R', angle: ang - Math.PI / 2, skin: sk, sleeve: sl });
    if (hd) c.drawImage(hd.cv, Math.round(x - hd.ax), Math.round(y - hd.ay));
  }
  const living = {
    phases: [['tamotsu', 700], ['sickle', 900]],
    safe: { wide: 'Heita\'s face and the sickle in the top 55 %', narrow: 'Heita\'s face in the upper half', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomLiving(w, h, st.vb), { s, hx, hy } = G, still = st.still;
      const GR = geomRev(w, h, st.vb);
      c.drawImage(revStatic(GR).cv, 0, 0);
      // the crowd behind him, small, facing the stage
      crowdRev(c, GR, st, { skip: ['co_heita', 'co_tamotsu', 'co_nobu', 'co_fusa', 'co_ume', 'co_goro'], pose: (p) => (p.id === 'pc' || p.id === 'comp' ? ['down', 'i0'] : null) });
      const kt = st.at('tamotsu'), ks = st.at('sickle');
      const hb = Q.bust('co_heita', ks > 0.4 ? 'think2' : 'neutral', ks > 0.4 ? { look: [-1, 0] } : { look: [1, -1] }, FACE_R, false, 200);
      if (hb) c.drawImage(hb.cv, hx - hb.ax, hy - hb.ay);
      // the sickle: up from his side to the height of his shoulder, no higher
      if (ks > 0) {
        const e = ease(ks);
        sickle(c, hx + 58, lerp(G.vb + 40, hy - 40, e), 1.6, lerp(0.6, 0.15, e), skin('co_heita'), sleeve('co_heita'));
      }
      // Tamotsu at the right edge from behind, facing the crowd; his arm comes up, pointing at the hill
      const tb = Q.back(look('co_tamotsu'), Math.round(clamp(s(150), 100, 200)), { light: 'r' });
      const tx = Math.round(w - s(G.lay === 'narrow' ? 30 : 60)), tyb = Math.round(G.vb + s(70));
      if (tb) {
        if (kt > 0) {
          const e = ease(kt), shx = tx - tb.ax + tb.w * 0.2, shy = tyb - tb.h * 0.4;
          const hx2 = lerp(shx - s(10), shx - s(56), e), hy2 = lerp(shy + s(30), shy - s(50), e);
          c.strokeStyle = '#1e2a30'; c.lineWidth = s(11); c.lineCap = 'round'; c.beginPath(); c.moveTo(shx, shy); c.lineTo(hx2, hy2); c.stroke();
          c.strokeStyle = sleeve('co_tamotsu'); c.lineWidth = s(9); c.beginPath(); c.moveTo(shx, shy); c.lineTo(hx2, hy2); c.stroke(); c.lineCap = 'butt';
          const hd = Q.hand({ size: 12, pose: 'point', side: 'R', angle: Math.atan2(hy2 - shy, hx2 - shx), skin: skin('co_tamotsu') });
          if (hd) c.drawImage(hd.cv, Math.round(hx2 - hd.ax), Math.round(hy2 - hd.ay));
        }
        c.drawImage(tb.cv, tx - tb.ax, tyb - tb.ay);
      }
      if (!still) Q.dust(c, 0, 0, w, G.vb, -s(10), t, 6, '255,214,180', still, 13);
    },
    focus(w, h, vb) { const G = geomLiving(w, h, vb); return { x: G.hx - 32, y: G.hy - 90, w: 64, h: 58 }; },
  };

  // ==== ume: close on Ume under the eaves ======================================================================
  function geomUme(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const ux = Math.round(w * (lay === 'narrow' ? 0.5 : 0.46)), uy = lay === 'narrow' ? Math.round(vb - s(170)) : Math.max(Math.round(vb + s(8)), 98);
    return Object.assign(S, { ux, uy });
  }
  function eavesStatic(G) {
    return cached('ch3.eaves|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, uy } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(818);
      const yE = Math.round(Math.max(s(34), uy - 96 - s(30)));        // the eave's edge above her
      sky(g, w, yE + s(60), s, rnd, false);
      const L = p.layer(w, h);
      // the house behind her: the deep thatched eave and its rafters overhead, the great beam (the 梁 she
      // speaks of) on its posts, plaster panels in a timber frame above a skirting of dark boards, a lit window
      const plaster = p.mat('#7a685a', { n: 6, at: 3, step: 0.07 }), timber = p.mat('#4a3426', { n: 6, at: 3, step: 0.08 }), board = p.mat('#3e2c22', { n: 5, at: 2, step: 0.08 });
      const thatch = p.mat('#9a8250', { n: 7, at: 4, step: 0.07 });
      const beamY = yE + s(14), beamH = s(12), skirt = Math.round(lerp(beamY + beamH, h, 0.62));
      L.rect(0, beamY, w, h - beamY, plaster, (x, y) => clamp(0.56 - (y - beamY) / (h - beamY) * 0.22 + (((x * 3 + y * 7) % 17) === 0 ? 0.06 : 0) - (((x * 11 + y * 5) % 29) === 0 ? 0.08 : 0), 0, 0.999));
      L.rect(0, skirt, w, h - skirt, board, (x, y) => ((Math.round(x) % s(10)) < 1 ? 0.1 : y < skirt + 2 ? 0.7 : 0.4));
      const posts = [];
      for (let x = s(14); x < w; x += s(118)) posts.push(x);
      for (const x of posts) L.rect(x, beamY, s(9), h - beamY, timber, (xx) => (xx < x + s(3) ? 0.8 : xx < x + s(7) ? 0.48 : 0.28));
      L.rect(0, Math.round(lerp(beamY + beamH, skirt, 0.5)), w, s(5), timber, (x, y) => (y < lerp(beamY + beamH, skirt, 0.5) + 1 ? 0.75 : 0.32));
      // the great beam: grain along it, lit along its top
      L.rect(0, beamY, w, beamH, timber, (x, y) => clamp((y < beamY + 2 ? 0.85 : 0.5) + (Math.sin(x * 0.07 + Math.sin(x * 0.013) * 4 + y) > 0.8 ? -0.14 : 0), 0, 0.999));
      // the lit window (shōji) in the far panel
      const wx = Math.round(w * 0.72), wy = beamY + beamH + s(14), ww = s(54), wh = Math.min(s(40), skirt - wy - s(8));
      if (wh > s(12)) {
        L.rect(wx, wy, ww, wh, p.mat('#f2cc8e', { n: 4, at: 2 }), (x, y) => clamp(0.9 - (y - wy) / wh * 0.3, 0, 0.999));
        for (let x = wx + s(9); x < wx + ww; x += s(9)) L.rect(x, wy, 1, wh, timber, 1);
        for (let y = wy + s(10); y < wy + wh; y += s(10)) L.rect(wx, y, ww, 1, timber, 1);
        L.rect(wx - s(3), wy - s(3), ww + s(6), s(3), timber, 3); L.rect(wx - s(3), wy + wh, ww + s(6), s(4), timber, 1);
      }
      // the eave: a deep, layered thatch with its trimmed edge, the rafter ends under it
      const eaveTop = Math.max(0, yE - s(30));
      L.fill(-s(10), eaveTop, w + s(10), yE + s(6), (x, y) => y >= eaveTop + Math.round((x / w) * s(10)) && y <= yE + Math.round(Math.sin(x * 0.05) * 1.2), thatch, (x, y) => {
        const d = (yE - y) / Math.max(1, yE - eaveTop), strand = ((Math.round(x * 1.7) + Math.round(y / 3) * 5) % 7);
        return clamp(0.78 - d * 0.32 + (strand === 0 ? -0.18 : strand === 3 ? 0.1 : 0) + (y > yE - s(3) ? 0.12 : 0), 0, 0.999);
      });
      L.rect(-s(10), yE + s(4), w + s(20), s(4), board, (x, y) => (y < yE + s(5) ? 0.55 : 0.2));
      for (let x = s(6); x < w; x += s(24)) L.rect(x, yE + s(7), s(5), s(6), timber, (xx) => (xx < x + 2 ? 0.7 : 0.35));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // a little warm light round the lit window (stepped, never a hard-edged patch)
      if (wh > s(12)) p.halo(g, wx + Math.round(ww / 2), wy + Math.round(wh / 2), Math.round(ww * 1.1), '255,190,110', 0.12, 3);
      // persimmons drying on strings from the beam (hoshigaki), in a row at the left
      for (let i = 0; i < 5; i++) {
        const sx = Math.round(w * 0.04 + i * s(17)), n = 6 + (i % 2), sy0 = beamY + beamH;
        R(g, sx, sy0, 1, n * s(9) + s(2), '#5a4630');
        for (let j = 0; j < n; j++) {
          const y = sy0 + s(6) + j * s(9), r = Math.max(2, s(4));
          g.fillStyle = '#7a3418'; P().disc(g, sx, y + 1, r, r);
          g.fillStyle = j % 3 ? '#b8582a' : '#a84e24'; P().disc(g, sx, y, r, r - 1);
          R(g, sx - Math.round(r * 0.5), y - Math.round(r * 0.5), Math.max(1, Math.round(r * 0.5)), 1, '#e89a5a');
          R(g, sx - 1, y - r - 1, 3, 1, '#4a5a2a'); // the calyx
        }
      }
      return { cv };
    });
  }
  const ume = {
    phases: [['ume', 0], ['up', 900]],
    safe: { wide: 'Ume\'s face in the top 55 %', narrow: 'her face in the upper half', land: 'her face' },
    draw(c, w, h, t, st) {
      const G = geomUme(w, h, st.vb), { s, ux, uy } = G, still = st.still;
      c.drawImage(eavesStatic(G).cv, 0, 0);
      const ku = st.at('up');
      const ub = Q.bust('co_ume', ku > 0.4 ? 'sad' : 'closed', ku > 0.4 ? { look: [1, -1], head: [0, -1] } : { head: [0, 1] }, FACE_L, false, 200);
      if (ub) c.drawImage(ub.cv, ux - ub.ax, uy - ub.ay);
      if (!still) Q.dust(c, 0, 0, w, G.vb, s(14), t, 6, '255,214,180', still, 3);
    },
    focus(w, h, vb) { const G = geomUme(w, h, vb); return { x: G.ux - 32, y: G.uy - 90, w: 64, h: 58 }; },
  };

  // ==== hands: from the stage, every hand ======================================================================
  function geomHands(w, h, vb) {
    const G = geomRev(w, h, vb), { s, lay } = G;
    const fx = Math.round(w * (lay === 'narrow' ? 0.72 : 0.78)), fy = Math.max(Math.round(vb + s(10)), 98);
    return Object.assign(G, { fx, fy });
  }
  const FIRST = ['co_nobu', 'co_goro'];
  const hands = {
    phases: [['two', 700], ['fusa', 800], ['all', 1400]],
    safe: { wide: 'the crowd in the band above the sheet, Fusa close at the right', narrow: 'the crowd in the upper 55 %', land: 'Fusa\'s face and the front row' },
    draw(c, w, h, t, st) {
      const G = geomHands(w, h, st.vb), { s, fx, fy } = G, still = st.still;
      c.drawImage(revStatic(G).cv, 0, 0);
      const k2 = st.at('two'), kf = st.at('fusa'), ka = st.at('all');
      crowdRev(c, G, st, {
        skip: ['co_fusa'],
        pose: (p, i) => {
          if (p.id === 'pc' || p.id === 'comp') return ['down', 'i0'];
          const first = FIRST.indexOf(p.id);
          if (first >= 0 && k2 > 0.2 + first * 0.4) return ['down', 'p:tend1'];
          if (ka > 0.05 + ((i * 37) % 10) / 14) return ['down', 'p:tend1'];
          return ['down', 'i0'];
        },
      });
      // Fusa close in front, her hand up for her sister
      const fb = Q.bust('co_fusa', kf > 0.3 ? 'sad' : 'worry', kf > 0.3 ? { look: [-1, -1] } : { look: [0, 1] }, FACE_R, false, 200);
      if (fb) c.drawImage(fb.cv, fx - fb.ax, fy - fb.ay);
      if (kf > 0) {
        const e = ease(kf), hd = Q.hand({ size: 12, pose: 'rest', side: 'R', angle: -Math.PI / 2 - 0.15, skin: skin('co_fusa'), sleeve: sleeve('co_fusa') });
        if (hd) c.drawImage(hd.cv, Math.round(fx - s(44) - hd.ax), Math.round(lerp(G.vb + s(30), fy - 96 + s(10), e) - hd.ay));
      }
      if (!still) Q.dust(c, 0, G.y0 - s(40), w, G.vb, -s(10), t, 8, '255,214,180', still, 21);
    },
    focus(w, h, vb) {
      const G = geomHands(w, h, vb);
      if (G.lay === 'land') return { x: G.fx - 32, y: G.fy - 90, w: 64, h: 58 };
      const y = G.row(0.04) - Math.round(58 * G.sc(0.1)); return { x: G.col(-0.9, 0.5), y, w: G.col(0.9, 0.5) - G.col(-0.9, 0.5), h: Math.round(G.vb - y - G.s(6)) };
    },
  };

  // ==== ink: the chronicle's page, the new line ================================================================
  function geomInk(w, h, vb) {
    const S = stage(w, h, vb), { s } = S;
    const k = clamp(Math.min((w * 0.84) / 128, (vb - s(14)) / 86), 0.6, 3);
    const W = Math.round(64 * k), H = Math.round(80 * k), x = Math.round(w / 2), y = Math.round(Math.max(H / 2 + s(4), (vb - s(6)) / 2 + s(2)));
    return Object.assign(S, { k, W, H, x, y });
  }
  // the columns of the page: old ones (faded), right to left; the new one is the leftmost
  function inkStatic(G) {
    return cached('ch3.ink|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, k, W, H, x, y } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(616);
      // a dark lectern of oiled wood, the lantern light pooled on the book
      const L = p.layer(w, h), wood = p.mat('#4a3222', { n: 6, at: 3, step: 0.07 });
      L.rect(0, 0, w, h, wood, (xx, yy) => clamp(0.3 + (Math.sin(yy * 0.4 + Math.sin(xx * 0.02) * 3) > 0.85 ? 0.1 : 0) - Math.abs(yy - y) / h * 0.12, 0, 0.999));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      g.fillStyle = 'rgba(255,190,120,0.08)'; g.fillRect(x - W - Math.round(14 * k), y - H / 2 - Math.round(10 * k), W * 2 + Math.round(28 * k), H + Math.round(20 * k));
      // the book: the cover's edge, the page block, the two pages with the gutter's shadow
      R(g, x - W - Math.round(4 * k), y - H / 2 - Math.round(3 * k), W * 2 + Math.round(8 * k), H + Math.round(6 * k), '#2a3448');
      R(g, x - W - Math.round(2 * k), y - H / 2 - Math.round(1 * k), W * 2 + Math.round(4 * k), H + Math.round(3 * k), '#c8b898');
      R(g, x - W, y - H / 2, W * 2, H, '#e6d8b8');
      for (let i = 0; i < Math.round(6 * k); i++) { g.fillStyle = 'rgba(120,96,70,' + (0.04 * (6 * k - i) / (6 * k)).toFixed(3) + ')'; g.fillRect(x - i - 1, y - H / 2, 1, H); g.fillRect(x + i, y - H / 2, 1, H); }
      // foxing and age on the paper
      for (let i = 0; i < 40; i++) { const fx = x - W + Math.round(rnd() * W * 2), fy = y - H / 2 + Math.round(rnd() * H); R(g, fx, fy, 1, 1, 'rgba(160,120,80,0.25)'); }
      // ruled column lines, then the old writing: columns of marks (a texture, not characters)
      const cw = Math.max(4, Math.round(7 * k));
      const cols = [];
      for (let cx0 = x + W - Math.round(6 * k); cx0 > x - W + Math.round(4 * k); cx0 -= cw) cols.push(cx0);
      cols.forEach((cx0) => { g.fillStyle = 'rgba(150,110,80,0.18)'; g.fillRect(cx0 + Math.round(cw / 2), y - H / 2 + Math.round(4 * k), 1, H - Math.round(8 * k)); });
      const newCol = cols.filter((cx0) => cx0 < x - Math.round(4 * k))[Math.max(0, cols.filter((cx0) => cx0 < x - Math.round(4 * k)).length - 2)];
      cols.forEach((cx0, i) => {
        if (Math.abs(cx0 - x) < Math.round(4 * k) || cx0 <= newCol) return;
        const len = H - Math.round((10 + (i % 3) * 6 + (rnd() < 0.2 ? 30 : 0)) * k);
        markColumn(g, cx0, y - H / 2 + Math.round(6 * k), len, k, rnd, 'rgba(66,54,62,0.55)', 'rgba(66,54,62,0.3)');
      });
      return { cv, newCol, cw };
    });
  }
  // a writing brush held as for calligraphy, seen from above: in its own frame the inked tip at the origin and the
  // shaft along +x; the thumb on the far side, two fingers on the near side, the back of the hand, the sleeve
  // beyond; turned so the shaft rises to the upper right. Anchor: the tip.
  function brushHand(k, sk, sl) {
    return Q.small('ch3.brush|' + k + '|' + sk.join(',') + '|' + sl, () => {
      const p = P(), S = Math.round(110 * k), L = p.layer(S, S), ox = Math.round(S * 0.12), oy = Math.round(S * 0.86);
      const skinM = p.mat(sk[0], { n: 6, at: 3, step: 0.075, lineCol: '#2a1410' }), cloth = p.mat(sl, { n: 5, at: 2, step: 0.09 });
      const bam = p.mat('#a88450', { n: 5, at: 3, step: 0.09 }), hair = p.mat('#2a2024', { n: 3, at: 1 }), fer = p.mat('#c8b080', { n: 4, at: 2 });
      L.translate(ox, oy); L.rotate(-1.05);
      L.poly([[40 * k, -9 * k], [40 * k, 15 * k], [120 * k, 30 * k], [120 * k, -30 * k]], cloth, (x, y) => clamp(0.62 - (y + 30 * k) / (60 * k) * 0.45, 0, 0.999));
      L.seg(6 * k, 0, 52 * k, 0, Math.max(2, 2.4 * k), bam, (x, y) => (y < 0 ? 0.85 : 0.45));
      for (let d = 14; d < 52; d += 9) L.rect(d * k, -1.2 * k, Math.max(1, k * 0.6), 2.4 * k, bam, 1);
      L.seg(5 * k, 0, 7.5 * k, 0, Math.max(2, 2.8 * k), fer, 2);
      L.seg(0.5 * k, 0, 5 * k, 0, Math.max(1, 2.2 * k), hair, 1); L.seg(0, 0, 2 * k, 0, Math.max(1, 1.2 * k), hair, 0);
      L.ell(31 * k, 8 * k, 10 * k, 6.5 * k, skinM, (x, y) => clamp(0.8 - (y - 2 * k) / (12 * k) * 0.45, 0, 0.999));
      L.seg(28 * k, -6 * k, 21 * k, -1.6 * k, Math.max(2, 3.4 * k), skinM, (x, y) => (y < -3 * k ? 0.85 : 0.6));
      L.seg(32 * k, 5 * k, 22 * k, 2.2 * k, Math.max(2, 3.1 * k), skinM, 0.6);
      L.seg(31 * k, 9.5 * k, 21 * k, 5 * k, Math.max(2, 3.1 * k), skinM, 0.45);
      L.outline();
      return { cv: L.canvas(), ax: ox, ay: oy };
    });
  }
  // a column of brush marks: short strokes and dots, stacked with small gaps (writing as texture)
  function markColumn(g, x, y0, len, k, rnd, col, col2, upto) {
    const unit = Math.max(3, Math.round(6 * k));
    let y = y0, n = 0;
    while (y < y0 + len) {
      const seg = Math.max(2, Math.round(unit * (0.6 + rnd() * 0.5)));
      if (upto != null && y > upto) break;
      const r = rnd();
      g.fillStyle = col;
      if (r < 0.45) g.fillRect(Math.round(x - unit * 0.3), y + Math.round(seg * 0.3), Math.max(2, Math.round(unit * 0.7)), Math.max(1, Math.round(k * 0.8)));
      else if (r < 0.8) g.fillRect(Math.round(x), y, Math.max(1, Math.round(k * 0.8)), seg);
      else { g.fillRect(Math.round(x - 1), y + 1, Math.max(1, Math.round(k * 0.8)), Math.max(1, Math.round(k * 0.8))); g.fillRect(Math.round(x + unit * 0.2), y + Math.round(seg * 0.5), Math.max(1, Math.round(k * 0.8)), Math.max(1, Math.round(k * 0.8))); }
      if (col2) { g.fillStyle = col2; g.fillRect(Math.round(x - unit * 0.25), y + seg - 1, Math.round(unit * 0.5), 1); }
      y += seg + Math.max(1, Math.round(unit * 0.35));
      n++;
    }
    return y;
  }
  const ink = {
    phases: [['write', 1400], ['sink', 1000]],
    safe: { wide: 'the page and the brush central above the sheet', narrow: 'the page in the upper half', land: 'the new column on the page' },
    draw(c, w, h, t, st) {
      const G = geomInk(w, h, st.vb), { s, k, H, y } = G, still = st.still;
      const S0 = inkStatic(G);
      c.drawImage(S0.cv, 0, 0);
      const kw = st.at('write'), ks = st.at('sink');
      const x0 = S0.newCol, y0 = y - H / 2 + Math.round(6 * k), len = H - Math.round(16 * k);
      const upto = y0 + len * clamp(kw / 0.92, 0, 1);
      // the new column, written as far as the brush has gone: wet and glossy at first, then sinking in
      const wet = ks <= 0 ? 1 : 1 - ease(ks);
      const end = markColumn(c, x0, y0, len, k * 1.15, P().rnd(4242), '#1a1216', wet > 0.05 ? 'rgba(170,170,190,' + (0.6 * wet).toFixed(2) + ')' : null, upto);
      // the slow ripple of darkness into the paper (once; a still frame with reduced motion)
      if (ks > 0 && ks < 1 && !still) {
        const r = Math.round(lerp(s(2), s(14) * k / 2, ease(ks)));
        c.fillStyle = 'rgba(60,36,30,' + (0.18 * (1 - ks)).toFixed(3) + ')';
        c.fillRect(x0 - r, y0 - Math.round(r / 2), r * 2, len + r);
      }
      if (ks >= 1 || (still && ks > 0)) { c.fillStyle = 'rgba(60,36,30,0.08)'; c.fillRect(x0 - Math.round(3 * k), y0 - 1, Math.round(6 * k), len + 2); }
      // trembling as it writes; lifted clear of the page when the line is done
      const writing = kw < 1;
      const jit = writing && !still ? Math.round(Math.sin(t / 47) * 0.9 + Math.sin(t / 113) * 0.6) : 0;
      const tipX = x0 + jit + (writing ? 0 : Math.round(10 * k)), tipY = (writing ? Math.min(end, upto) : y0 + len * 0.5) - (writing ? 0 : Math.round(6 * k));
      // the brush in his hand: the inked tip on the page, the shaft up to the right, his sleeve beyond
      const bh = brushHand(Math.round(k * 4) / 4, skin('co_tokiwa'), sleeve('co_tokiwa'));
      c.drawImage(bh.cv, Math.round(tipX - bh.ax), Math.round(tipY - bh.ay));
      if (!still) Q.dust(c, 0, 0, w, G.vb, s(6), t, 6, '255,220,170', still, 61);
    },
    focus(w, h, vb) { const G = geomInk(w, h, vb); return { x: G.x - G.W, y: G.y - G.H / 2, w: G.W * 2, h: G.H }; },
  };

  RB.sequence.define('ch3.assembly', {
    title: { en: 'The assembly at dusk', jp: '{夕暮|ゆうぐ}れ の {寄|よ}り{合|あ}い' }, chapter: 3, scene: 'co.assembly', memory: true,
    memo: { jp: '', en: 'At dusk in Cinder Orchard, the village raised its hands, and Tokiwa wrote the fire back into the chronicle.' },
    shots: { dusk, confess, voices, names, living, ume, hands, ink, night },
  });

  // ==== ch3.firebreaks: the morning's work =====================================================================
  // A terraced slope seen from below and in front: rows of terraces across the frame, far (high) to near (low).
  // Row i: its lip lip(x); below it a riser of dry stone down to foot(x); the next row's flat runs from that foot
  // down to the next lip. Nearer rows are lower, deeper and taller; the rows bow gently round the hill.
  function terraceRows(o, s) {
    const rows = [];
    for (let i = 0; i < o.n; i++) {
      const f = o.n > 1 ? i / (o.n - 1) : 1, fe = Math.pow(f, o.pow || 1.4);
      rows.push({ i, f, y: lerp(o.y0, o.y1, fe), rh: Math.max(2, Math.round(lerp(s(o.r0 || 3), s(o.r1 || 20), fe))) });
    }
    rows.forEach((r) => {
      r.lip = (x) => Math.round(r.y + Math.pow((x - o.cx) / o.w, 2) * s(o.arc || 30) * (0.4 + r.f));
      r.foot = (x) => r.lip(x) + r.rh;
    });
    return rows;
  }
  function drawTerraces(L, w, h, s, rows, o) {
    const p = P();
    const flat = p.mat(o.flat || '#6a7442', { n: 6, at: 3, step: 0.07 }), stone = p.mat(o.stone || '#8a8276', { n: 6, at: 3, step: 0.085 });
    const lightL = o.light !== 'r', cx = o.cx;
    rows.forEach((r, i) => {
      const prev = i ? rows[i - 1].foot : (x) => r.lip(x) - (o.top || s(8));
      const yA = Math.min(prev(cx), prev(0), prev(w)) - 2, yB = Math.max(r.lip(0), r.lip(w), r.lip(cx)) + 2;
      L.fill(0, yA, w, yB, (x, y) => y >= prev(x) && y < r.lip(x), flat, (x, y) => {
        const d = r.lip(x) - y;
        if (d <= 1) return 0.9;
        const n = ((x * 3 + y * 5 + i * 7) % 19) === 0 ? 0.12 : ((x * 11 + y * 3) % 23) === 0 ? -0.14 : 0;
        return clamp(0.58 + n - (d / Math.max(1, r.lip(x) - prev(x))) * 0.12 + (o.lightX != null ? (x - o.lightX) / w * -0.12 : 0), 0, 0.999);
      });
      const bh = Math.max(2, Math.round(r.rh / 2.3)), bw = Math.max(4, Math.round(bh * 2.3));
      L.fill(0, yB - r.rh - 4, w, yB + r.rh + 2, (x, y) => y >= r.lip(x) && y < r.foot(x) && !(o.notch && o.notch(i, x)), stone, (x, y) => {
        const yy = y - r.lip(x), row = Math.floor(yy / bh), xx = x + (row % 2) * Math.round(bw / 2) + i * 5, ix = ((xx % bw) + bw) % bw, iy = yy - row * bh;
        if (iy === 0 || ix === 0) return 0.1;
        const hs = ((Math.floor(xx / bw) * 7 + row * 13 + i) % 5) * 0.04;
        return clamp(0.48 + hs + (lightL ? (ix === 1 ? 0.24 : 0) : (ix === bw - 1 ? 0.24 : 0)) + (iy === 1 ? 0.1 : 0) - yy / r.rh * 0.14, 0, 0.999);
      });
    });
    // below the nearest riser, the next flat runs on out of the frame
    const last = rows[rows.length - 1];
    L.fill(0, Math.min(last.foot(cx), last.foot(0)) - 1, w, h, (x, y) => y >= last.foot(x), flat, (x, y) => clamp(0.6 + (((x * 3 + y * 5) % 19) === 0 ? 0.12 : 0) - (((x * 11 + y * 3) % 23) === 0 ? 0.14 : 0), 0, 0.999));
  }
  // persimmon trees standing on the flats: a short trunk, a round crown, a few fruit
  function orchard(L, g, rows, s, rnd, o) {
    const p = P(), leaf = p.mat(o.leaf || '#40502e', { n: 5, at: 2, step: 0.08 }), bark = p.mat('#4a3628', { n: 4, at: 2 });
    const fruitAt = [];
    rows.forEach((r, i) => {
      if (!i) return;
      for (let j = 0; j < (o.per || 4); j++) {
        const x = Math.round(rnd() * o.w);
        if (o.avoid && o.avoid(i, x)) continue;
        const y = r.lip(x) - 1, cr = Math.max(2, Math.round(lerp(s(3), s(12), r.f) * (0.8 + rnd() * 0.4)));
        L.rect(x - Math.max(1, Math.round(cr / 6)), y - Math.round(cr * 0.9), Math.max(1, Math.round(cr / 3)), Math.round(cr * 0.9), bark, 1);
        L.ell(x, y - Math.round(cr * 1.5), cr, Math.round(cr * 0.8), leaf, p.sphere(x - cr * 0.3, y - cr * 1.8, cr, cr * 0.8, { amb: 0.3 }));
        for (let q = 0; q < Math.max(1, Math.round(cr / 3)); q++) fruitAt.push([x + Math.round((rnd() - 0.5) * cr * 1.4), y - Math.round(cr * 1.5 + (rnd() - 0.5) * cr)]);
      }
    });
    return fruitAt;
  }
  // the scrub of the upper slope: low, dense, olive and brown, in tufts
  function scrub(g, x0, y0, w, y1, s, k, top) {
    for (let y = Math.round(y0); y < y1; y += 2) {
      const ty = top ? top(y) : 0;
      for (let x = x0 + ((y * 7) % 3); x < x0 + w; x += 2) {
        if (top && y < top(x)) continue;
        const hsh = (x * 13 + y * 7) % 11;
        if (hsh < 4) { g.fillStyle = hsh === 0 ? 'rgba(130,120,60,' + k + ')' : hsh === 1 ? 'rgba(46,58,30,' + k + ')' : 'rgba(80,88,42,' + k + ')'; g.fillRect(x, y - 1 - (hsh % 2), 1, 2 + (hsh % 2)); }
      }
      void ty;
    }
  }
  const VILLAGE_LINE = ['co_heita', 'co_tamotsu', 'co_sayo', 'co_nobu', 'hiro', 'co_asa', 'co_isao', 'co_fusa', 'co_shino'];

  // ---- climb: up the terraces at dawn with sickles, Heita first ------------------------------------------------
  function geomClimb(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow', land = lay === 'land';
    const yS = Math.round(vb * (narrow ? 0.16 : land ? 0.12 : 0.18));
    const y0 = Math.round(vb * (narrow ? 0.38 : land ? 0.32 : 0.44)), y1 = Math.round(vb + s(narrow ? 120 : 70));
    const n = narrow ? 8 : 6, cx = Math.round(w * 0.5);
    const rows = terraceRows({ n, y0, y1, w, cx, r0: 4, r1: narrow ? 26 : 22, arc: 34 }, s);
    // where the path climbs each riser: zigzagging, wider apart nearer to us
    const px = rows.map((r) => Math.round(cx + (r.i % 2 ? 1 : -1) * lerp(s(24), s(narrow ? 70 : 120), r.f) - s(narrow ? 0 : 30)));
    // the path as a polyline, from the nearest row up to the farthest: across the flat, then up the steps
    const pts = [];
    for (let i = rows.length - 1; i >= 0; i--) { pts.push([px[i], rows[i].foot(px[i]) + (i === rows.length - 1 ? s(30) : 0), rows[i].f]); pts.push([px[i], rows[i].lip(px[i]) - 1, rows[i].f]); }
    const segs = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); total += l; }
    const at = (u) => {
      let d = clamp(u, 0, 1) * total;
      for (let i = 0; i < segs.length; i++) {
        if (d <= segs[i] || i === segs.length - 1) { const k = segs[i] ? clamp(d / segs[i], 0, 1) : 0, a = pts[i], b = pts[i + 1]; return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), f: lerp(a[2], b[2], k), dx: b[0] - a[0], dy: b[1] - a[1] }; }
        d -= segs[i];
      }
      return { x: pts[0][0], y: pts[0][1], f: 1, dx: 0, dy: -1 };
    };
    const sc = (f) => lerp(0.42, narrow ? 0.95 : 1.05, f) * clamp(S.Z, 0.5, 1.1);
    return Object.assign(S, { yS, y0, y1, rows, px, at, sc, cx, n });
  }
  function climbStatic(G) {
    return cached('ch3.climb|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yS, y0, rows, px } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(31);
      // dawn: the sun just up over the eastern hills (our right)
      Q.bandsIn(g, 0, 0, w, yS + s(8), ['#5a5a8a', '#7a6c96', '#a8829c', '#d89c9a', '#f0bc98', '#ffd8a8'], 0.45);
      const sx = Math.round(w * 0.88), sy = Math.round(yS * 0.78);
      p.halo(g, sx, sy, s(46), '255,220,170', 0.3, 4); g.fillStyle = '#fff2d0'; p.disc(g, sx, sy, Math.max(3, s(6)));
      const L = p.layer(w, h);
      // the upper slope: the ridge line, then scrub down to the top terrace (the old firebreaks run across it)
      const ridge = (x) => yS - s(4) + Math.round(Math.sin(x / (w * 0.17) + 1.1) * s(5) + (x / w) * s(8));
      L.fill(0, 0, w, y0 + s(4), (x, y) => y >= ridge(x), p.mat('#4e5236', { n: 6, at: 3, step: 0.07 }), (x, y) => clamp(0.42 + (y - ridge(x)) / (y0 - yS) * 0.18 + (((x * 5 + y * 3) % 13) === 0 ? 0.1 : 0), 0, 0.999));
      drawTerraces(L, w, h, s, rows, { cx: G.cx, flat: '#667040', light: 'r', lightX: w, top: s(6), notch: (i, x) => Math.abs(x - px[i]) <= s(5) + Math.round(rows[i].f * s(6)) });
      const fr = orchard(L, g, rows, s, rnd, { w, per: 4, avoid: (i, x) => Math.abs(x - px[i]) < s(26) || (i > 0 && Math.abs(x - px[i - 1]) < s(26)) });
      // the stone steps up each riser where the path crosses it, and the worn track across each flat
      const st = p.mat('#a49a8c', { n: 5, at: 2, step: 0.09 }), track = p.mat('#a08a68', { n: 4, at: 2 });
      rows.forEach((r, i) => {
        const x = px[i], hw = s(5) + Math.round(r.f * s(6)), lip = r.lip(x), ft = r.foot(x), k = Math.max(2, Math.round(r.rh / 4));
        for (let y = lip; y < ft; y += k) L.rect(x - hw, y, hw * 2 + 1, k, st, (xx, yy) => (yy === y ? 0.9 : xx > x + hw - 2 ? 0.3 : 0.55));
        if (i < rows.length - 1) {
          const nx = px[i + 1], nf = rows[i + 1];
          L.seg(x, ft + 1, nx, nf.lip(nx) - 1, Math.max(2, lerp(s(2), s(6), nf.f)), track, 0.75);
        }
      });
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // scrub on the upper slope and the three old firebreak strips, grown over (the cutting is today)
      scrub(g, 0, yS, w, rows[0].lip(G.cx) - s(4), s, 0.7, (x) => ridge(x) + 2);
      for (let i = 0; i < 3; i++) {
        const yy = (x) => Math.round(lerp(yS + s(10), rows[0].lip(x) - s(10), (i + 0.5) / 3.2) + Math.sin(x / (w * 0.15) + i) * s(2));
        for (let x = 0; x < w; x += 2) { const hh = Math.max(2, s(4)) + ((x * 7 + i * 13) % 3); g.fillStyle = (x % 6) ? 'rgba(52,62,30,0.75)' : 'rgba(104,98,50,0.7)'; g.fillRect(x, yy(x) - hh, 2, hh); }
      }
      for (const [x, y] of fr) R(g, x, y, Math.max(1, s(1.5)), Math.max(1, s(1.5)), '#e88a34');
      return { cv };
    });
  }
  const climb = {
    phases: [['climb', 1500]],
    safe: { wide: 'the line of climbers on the steps above the sheet', narrow: 'the path up the frame, Heita high on it', land: 'Heita and the first climbers' },
    draw(c, w, h, t, st) {
      const G = geomClimb(w, h, st.vb), { s } = G, still = st.still;
      c.drawImage(climbStatic(G).cv, 0, 0);
      const k = st.at('climb'), adv = ease(k) * 0.12;
      const walking = !still && k > 0 && k < 1;
      for (let i = VILLAGE_LINE.length - 1; i >= 0; i--) {
        const p = G.at(0.84 - i * 0.07 + adv), sc = G.sc(p.f);
        const dir = Math.abs(p.dy) > Math.abs(p.dx) ? 'up' : p.dx > 0 ? 'right' : 'left';
        const key = walking ? 'w' + ((Math.floor(t / 110) + i * 3) % 8) : 'i0';
        shadow(c, p.x, p.y, s(7) * sc, 0.26);
        put(c, fig(look(VILLAGE_LINE[i]), dir, key, sc, DAWN), p.x, p.y);
        // the sickle carried over the shoulder: its handle across the back, the blade's hook catching the dawn
        const side = dir === 'left' ? 1 : -1, sx = Math.round(p.x + side * 4 * sc), sy = Math.round(p.y - 36 * sc);
        const hl = Math.max(3, Math.round(9 * sc)), r = Math.max(2, Math.round(3.5 * sc));
        for (let q = 0; q < hl; q++) R(c, sx + Math.round(side * q * 0.55), sy + Math.round(q * 0.8), 1, 1, '#7a5432');
        c.fillStyle = '#e8ecf2';
        for (let a = 0; a < 6; a++) { const an = Math.PI * (1 + a / 7); R(c, sx + Math.round(Math.cos(an) * r * -side), sy - 1 + Math.round(Math.sin(an) * r), 1, 1); }
      }
    },
    focus(w, h, vb) {
      const G = geomClimb(w, h, vb), a = G.at(0.84 + 0.12), b = G.at(0.84 - 3 * 0.07 + 0.12);
      const top = Math.round(a.y - 58 * G.sc(a.f)), x0 = Math.min(a.x, b.x) - 14, x1 = Math.max(a.x, b.x) + 14;
      return { x: Math.round(x0), y: Math.max(0, top), w: Math.round(x1 - x0), h: Math.round(Math.min(vb - 2, b.y) - Math.max(0, top)) };
    },
  };

  // ---- gate: the top water gate opened; the water falls terrace to terrace ---------------------------------------
  function geomGate(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow', land = lay === 'land';
    const cx = Math.round(w * (narrow ? 0.46 : 0.44));
    const y0 = Math.round(vb * (narrow ? 0.4 : land ? 0.82 : 0.5)), y1 = Math.round(vb + s(narrow ? 140 : 90));
    const rows = terraceRows({ n: narrow ? 5 : 4, y0, y1, w, cx, r0: 10, r1: 30, arc: 22, pow: 1.2 }, s);
    const rw = rows.map((r) => Math.round(lerp(s(9), s(22), r.f)));        // the runnel's half-width at each row
    const gw = s(30), gate = { x: cx, y: y0 - s(14) };                     // the gate stands back on the top terrace
    return Object.assign(S, { cx, y0, y1, rows, rw, gw, gate });
  }
  function gateStatic(G) {
    return cached('ch3.gate|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, cx, rows, rw, gw, gate } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(51);
      const yS = Math.max(s(10), gate.y - s(64));
      // morning: a clear sky over the upper slope, the ridge
      Q.bandsIn(g, 0, 0, w, yS + s(10), ['#7a9ccc', '#90acd4', '#a8bcd8', '#c4cccc', '#e2d8c0'], 0.45);
      const L = p.layer(w, h);
      const ridge = (x) => yS + Math.round(Math.sin(x / (w * 0.2) + 0.4) * s(5));
      L.fill(0, 0, w, rows[0].lip(cx) + 2, (x, y) => y >= ridge(x), p.mat('#58603a', { n: 6, at: 3, step: 0.07 }), (x, y) => clamp(0.44 + (y - ridge(x)) / (rows[0].y - yS) * 0.2 + (((x * 5 + y * 3) % 13) === 0 ? 0.1 : 0), 0, 0.999));
      drawTerraces(L, w, h, s, rows, { cx, flat: '#6a7444', light: 'l', top: Math.max(s(8), rows[0].y - gate.y + s(10)), notch: (i, x) => Math.abs(x - cx) <= rw[i] });
      orchard(L, g, rows, s, rnd, { w, per: 3, avoid: (i, x) => Math.abs(x - cx) < rw[i] + s(30) });
      // the runnel: a stone-lined channel down each flat, cut through each riser (dry until the gate opens)
      const lining = p.mat('#6a6258', { n: 5, at: 2, step: 0.09 });
      rows.forEach((r, i) => {
        if (!i) return;
        const top = rows[i - 1].foot(cx), bot = r.lip(cx), a = rw[i - 1], b = rw[i];
        L.fill(cx - b - s(4), top, cx + b + s(4), bot + 1, (x, y) => { const f = (y - top) / Math.max(1, bot - top), hw = lerp(a, b, f); return Math.abs(x - cx) <= hw + Math.max(1, s(2)); }, lining, (x, y) => { const f = (y - top) / Math.max(1, bot - top), hw = lerp(a, b, f); return Math.abs(x - cx) > hw ? 0.85 : 0.18; });
      });
      // the notch in each riser: a smooth stone sill (the water falls over it)
      rows.forEach((r, i) => L.rect(cx - rw[i], r.lip(cx), rw[i] * 2, Math.max(2, Math.round(r.rh * 0.25)), lining, 0.6));
      // the channel from the hill to the gate, and the gate's stone posts and beam
      const ch = p.mat('#5a6e86', { n: 5, at: 2 });
      L.poly([[cx - gw / 2 - s(5), gate.y + s(3)], [cx - s(10), yS + s(6)], [cx + s(10), yS + s(6)], [cx + gw / 2 + s(5), gate.y + s(3)]], lining, 0.45);
      L.poly([[cx - gw / 2, gate.y + s(2)], [cx - s(7), yS + s(8)], [cx + s(7), yS + s(8)], [cx + gw / 2, gate.y + s(2)]], ch, (x, y) => ((Math.round(x * 0.5 + y * 2) % 7) === 0 ? 0.75 : 0.35));
      for (const x of [cx - gw / 2 - s(8), cx + gw / 2]) L.stone([[x, gate.y + s(8)], [x, gate.y - s(26)], [x + s(8), gate.y - s(28)], [x + s(8), gate.y + s(8)]], p.mat('#8a8276', { n: 6, at: 3 }), { face: 3, bevel: 2 });
      L.rect(cx - gw / 2 - s(10), gate.y - s(34), gw + s(20), s(6), p.mat('#6a4a30', { n: 5, at: 2 }), (x, y) => (y < gate.y - s(33) ? 0.9 : 0.45));
      L.rect(cx - s(2), gate.y - s(46), s(4), s(12), p.mat('#5a3c24', { n: 4, at: 2 }), (x) => (x < cx ? 0.8 : 0.4)); // the winding post
      // the short run from the gate to the top terrace's lip
      L.fill(cx - rw[0] - s(4), gate.y + s(4), cx + rw[0] + s(4), rows[0].lip(cx) + 1, (x, y) => Math.abs(x - cx) <= lerp(gw / 2, rw[0], (y - gate.y) / Math.max(1, rows[0].lip(cx) - gate.y)) + s(2), lining, (x, y) => (Math.abs(x - cx) > lerp(gw / 2, rw[0], (y - gate.y) / Math.max(1, rows[0].lip(cx) - gate.y)) ? 0.85 : 0.18));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // falling water: a sheet with white streaks running down, foam where it lands
  function fall(c, x0, x1, y0, y1, t, still) {
    if (y1 <= y0 || x1 <= x0) return;
    c.fillStyle = '#7aa8c4'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let x = x0; x < x1; x++) {
      const ph = (x * 7) % 5;
      for (let y = y0; y < y1; y++) { const v = still ? (y + ph * 3) % 6 : Math.floor(y - t / 40 + ph * 3) % 6; if (v === 0 || (v === 1 && ph < 2)) { c.fillStyle = v ? 'rgba(220,236,246,0.7)' : 'rgba(250,252,255,0.85)'; c.fillRect(x, y, 1, 1); } }
    }
    c.fillStyle = 'rgba(240,248,252,0.85)'; c.fillRect(x0 - 1, y0, x1 - x0 + 2, 1);
  }
  function runWater(c, x0, x1, y0, y1, t, still) {
    if (y1 <= y0 || x1 <= x0) return;
    c.fillStyle = '#5e8cac'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let y = y0; y < y1; y++) { const o = still ? 0 : Math.floor(t / 90); if (((y + o) % 5) === 0) { c.fillStyle = 'rgba(210,232,244,0.55)'; c.fillRect(x0 + ((y * 3) % Math.max(1, x1 - x0 - 2)), y, Math.max(1, Math.round((x1 - x0) * 0.4)), 1); } }
  }
  const gate = {
    phases: [['open', 1600]],
    safe: { wide: 'the gate and Tamotsu in the top half, the falls below', narrow: 'the gate in the upper half, the falls down the frame', land: 'the gate and its board' },
    draw(c, w, h, t, st) {
      const G = geomGate(w, h, st.vb), { s, cx, rows, rw, gw, gate } = G, still = st.still;
      c.drawImage(gateStatic(G).cv, 0, 0);
      const k = st.at('open'), lift = ease(clamp(k / 0.45, 0, 1)), front = clamp((k - 0.2) / 0.8, 0, 1);
      // the water: through the gate, along the top terrace, then over each riser's sill and down each flat
      if (lift > 0.1) {
        const segs = [];
        segs.push(['run', gate.y + s(4), rows[0].lip(cx), gw / 2 - 1, rw[0]]);
        rows.forEach((r, i) => {
          segs.push(['fall', r.lip(cx), r.foot(cx), rw[i], rw[i]]);
          if (i < rows.length - 1) segs.push(['run', r.foot(cx), rows[i + 1].lip(cx), rw[i], rw[i + 1]]);
        });
        const reach = front * segs.length;
        segs.forEach((sg, i) => {
          const f = clamp(reach - i, 0, 1);
          if (f <= 0) return;
          const y0 = sg[1], y1 = Math.round(lerp(sg[1], sg[2], f)), hw = Math.round(lerp(sg[3], sg[4], f) * 0.82);
          if (sg[0] === 'run') runWater(c, cx - hw, cx + hw, y0, y1, t, still);
          else { fall(c, cx - hw, cx + hw, y0, y1, t, still); if (f >= 1) { c.fillStyle = 'rgba(244,250,252,0.9)'; P().disc(c, cx, sg[2], hw + s(3), Math.max(1, s(2))); } }
        });
      }
      // the gate's board, wound up out of the channel
      const bh = s(24), by = Math.round(gate.y + s(2) - lift * s(22));
      R(c, cx - gw / 2, by - bh, gw, bh, '#6e4c30'); R(c, cx - gw / 2, by - bh, gw, 1, '#9a7048'); R(c, cx - gw / 2, by - 1, gw, 1, '#3a2818');
      for (let x = cx - gw / 2 + s(8); x < cx + gw / 2; x += s(8)) R(c, x, by - bh, 1, bh, '#5a3c24');
      if (lift > 0.05 && lift < 1 && !still) { c.fillStyle = 'rgba(240,248,252,0.8)'; c.fillRect(cx - gw / 2, by, gw, 1); }
      // Tamotsu at the winding post: both hands on it, winding as the board comes up
      const sc = clamp(G.Z * 0.82, 0.5, 1);
      const winding = !still && k > 0 && k < 0.5;
      put(c, fig(look('co_tamotsu'), 'left', winding ? (Math.floor(t / 180) % 2 ? 'p:hang' : 'p:forward') : 'p:forward', sc, NOON), cx + gw / 2 + s(26), gate.y + s(2));
    },
    focus(w, h, vb) { const G = geomGate(w, h, vb); return { x: G.cx - G.gw / 2 - G.s(12), y: Math.max(0, G.gate.y - G.s(60)), w: G.gw + G.s(56), h: Math.min(vb - 2, G.gate.y + G.s(10)) - Math.max(0, G.gate.y - G.s(60)) }; },
  };

  // ---- breaks: three bands of yellow stubble across the hill, early afternoon -------------------------------------
  function geomBreaks(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow', land = lay === 'land';
    const yS = Math.round(vb * (narrow ? 0.14 : land ? 0.08 : 0.16));
    const yT = Math.round(vb * (narrow ? 0.6 : land ? 1.2 : 0.7));           // where the terraces begin
    const band = (i, x) => Math.round(lerp(yS + s(18), yT - s(18), i / 2) + (x / w - 0.5) * s(narrow ? 16 : 24) + Math.sin(x / (w * 0.22) + i * 1.7) * s(3));
    const rows = terraceRows({ n: 5, y0: yT + s(6), y1: vb + s(80), w, cx: w * 0.5, r0: 4, r1: 16, arc: 20 }, s);
    return Object.assign(S, { yS, yT, band, bh: s(narrow ? 11 : 10), rows });
  }
  function breaksStatic(G) {
    return cached('ch3.breaks|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yS, yT, rows } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(77);
      Q.bandsIn(g, 0, 0, w, yS + s(8), ['#5e90c4', '#76a2cc', '#94b6d4', '#b8ccd8'], 0.45);
      for (let i = 0; i < 2; i++) { g.fillStyle = 'rgba(255,255,255,0.6)'; p.disc(g, Math.round(w * (0.25 + i * 0.45)), Math.round(yS * 0.45), s(24), s(4)); }
      const L = p.layer(w, h);
      const ridge = (x) => yS + Math.round(Math.sin(x / (w * 0.18) + 2) * s(4) - (x / w) * s(6));
      L.fill(0, 0, w, yT + s(8), (x, y) => y >= ridge(x), p.mat('#56603a', { n: 6, at: 3, step: 0.07 }), (x, y) => clamp(0.42 + (y - ridge(x)) / (yT - yS) * 0.16 + (((x * 5 + y * 3) % 13) === 0 ? 0.1 : 0), 0, 0.999));
      drawTerraces(L, w, h, s, rows, { cx: w * 0.5, flat: '#6e7846', light: 'l', top: s(10) });
      const fr = orchard(L, g, rows, s, rnd, { w, per: 5 });
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      scrub(g, 0, yS, w, yT + s(4), s, 0.75, (x) => ridge(x) + 2);
      for (const [x, y] of fr) R(g, x, y, Math.max(1, s(1.5)), Math.max(1, s(1.5)), '#e88a34');
      return { cv };
    });
  }
  // one band of cut stubble from x 0 to xmax: pale yellow, short stalks, the cut edge's shadow above it
  function stubble(c, G, i, xmax) {
    const { band, bh } = G;
    for (let x = 0; x < xmax; x++) {
      const y = band(i, x);
      c.fillStyle = 'rgba(40,40,20,0.35)'; c.fillRect(x, y - 1, 1, 1);
      c.fillStyle = ((x * 7) % 5) ? '#d8b860' : '#c4a04a'; c.fillRect(x, y, 1, bh);
      if ((x % 3) === 0) { c.fillStyle = '#ecd280'; c.fillRect(x, y + ((x * 5) % Math.max(1, bh - 1)), 1, 1); }
      if ((x % 4) === 1) { c.fillStyle = '#a88a3a'; c.fillRect(x, y + bh - 1 - ((x * 3) % 3), 1, 1); }
    }
  }
  const breaks = {
    phases: [['cut', 1300]],
    safe: { wide: 'the three bands across the hill above the sheet', narrow: 'the bands stacked in the upper half', land: 'the top band' },
    draw(c, w, h, t, st) {
      const G = geomBreaks(w, h, st.vb), { s, band, bh } = G, still = st.still;
      c.drawImage(breaksStatic(G).cv, 0, 0);
      const k = st.at('cut');
      const sc = clamp(G.Z * 0.42, 0.3, 0.55);
      for (let i = 0; i < 3; i++) {
        const xmax = i < 2 ? w : Math.round(lerp(w * 0.62, w + s(4), ease(k)));
        stubble(c, G, i, xmax);
        // sheaves stood along the band
        for (let j = 0; j < 7; j++) {
          const x = Math.round(w * (0.06 + j * 0.14 + (i % 2) * 0.05)); if (x > xmax - s(8)) continue;
          const y = band(i, x) + bh - 1, hh = s(8);
          R(c, x - s(2), y - hh, s(5), hh, '#b8903a'); R(c, x - s(2), y - hh, 1, hh, '#ecd280'); R(c, x - s(2), y - Math.round(hh * 0.45), s(5), 1, '#7a5a24'); R(c, x - s(1), y - hh - s(2), s(3), s(2), '#c8a04a');
        }
        if (i === 2 && k < 1 && !still) put(c, fig(look('co_heita'), 'right', Math.floor(t / 200) % 2 ? 'p:low' : 'p:bend', sc, NOON), xmax + s(2), band(2, xmax) + bh);
      }
      // the people resting in the lowest band, sickles down; Heita, done, wiping his brow
      for (const [id, fx, key] of [['co_tamotsu', 0.2, 'p:sit'], ['co_sayo', 0.27, 'p:sit'], ['co_nobu', 0.48, 'p:hip'], ['co_asa', 0.7, 'p:sit'], ['co_isao', 0.76, 'p:sit']]) {
        const x = Math.round(w * fx); put(c, fig(look(id), 'down', key, sc, NOON), x, band(2, x) + bh);
      }
      if (k >= 1 || still) { const x = Math.round(w * 0.9); put(c, fig(look('co_heita'), 'down', 'p:brow', sc, NOON), x, band(2, x) + bh); }
      // a kite circling high over the cut hill
      if (!still) { const a = t / 3200; Q.gull(c, Math.round(w * 0.5 + Math.cos(a) * s(70)), Math.round(G.yS * 0.6 + Math.sin(a) * s(8)), t, 1, false, '#3a3430'); }
    },
    focus(w, h, vb) { const G = geomBreaks(w, h, vb), y0 = Math.max(0, Math.min(G.band(0, 0), G.band(0, w)) - G.s(4)), y1 = Math.min(vb - 2, Math.max(G.band(2, 0), G.band(2, w)) + G.bh); return G.lay === 'land' ? { x: 0, y: y0, w, h: Math.min(vb - 2, Math.max(G.band(0, 0), G.band(0, w)) + G.bh) - y0 } : { x: 0, y: y0, w, h: y1 - y0 }; },
  };

  // ---- rope: the new rope on Gorō's lookout, from below; everyone looking up --------------------------------------
  function geomRope(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow', land = lay === 'land';
    const tx = Math.round(w * 0.5), top = Math.round(Math.max(s(6), vb * (land ? 0.04 : 0.06)));
    const plat = top + s(56), base = Math.round(vb + s(narrow ? 160 : 110)), hw = s(narrow ? 34 : 40);
    const fy = land ? h + s(60) : Math.round(vb + s(narrow ? 30 : 36));
    return Object.assign(S, { tx, top, plat, base: land ? h + s(30) : base, hw, fy, yG: land ? Math.round(vb + s(20)) : fy - s(24) });
  }
  function ropeStatic(G) {
    return cached('ch3.rope|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, tx, top, plat, base, hw } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P();
      // the afternoon sky, looked up into: deeper blue overhead, paler toward the hills
      Q.bandsIn(g, 0, 0, w, h, ['#5a86bc', '#6a94c4', '#7ea2ca', '#94b2d0', '#acc2d4', '#c8d2d4'], 0.45);
      for (const [fx, fy, r] of [[0.16, 0.3, 26], [0.82, 0.18, 34], [0.7, 0.5, 18]]) { const cx0 = Math.round(w * fx), cy0 = Math.round(G.vb * fy); g.fillStyle = 'rgba(255,255,255,0.55)'; p.disc(g, cx0, cy0, s(r), s(5)); p.disc(g, cx0 + s(r * 0.6), cy0 - s(3), s(r * 0.6), s(4)); g.fillStyle = 'rgba(200,214,230,0.5)'; g.fillRect(cx0 - s(r), cy0 + s(3), s(r * 2), 1); }
      const L = p.layer(w, h), wood = p.mat('#6e4e34', { n: 6, at: 3, step: 0.085 }), roof = p.mat('#4a4652', { n: 5, at: 2, step: 0.09 });
      // the square's ground from the low horizon, the village roofs along it
      const G0 = p.layer(w, h);
      roofs(G0, w, G.yG - s(8), s, p.rnd(405), { wallTo: G.yG + s(2) });
      G0.rect(0, G.yG, w, h - G.yG, p.mat('#8a7458', { n: 6, at: 3, step: 0.07 }), (x, y) => clamp(0.6 - (y - G.yG) / (h - G.yG) * 0.2 + (((x * 7 + y * 3) % 17) === 0 ? 0.1 : 0), 0, 0.999));
      G0.outline();
      g.drawImage(G0.canvas(), 0, 0);
      // four legs, converging upward (the far pair thinner and darker), braced in X at each level
      const legX = (side, near, y) => tx + side * lerp(hw * (near ? 0.9 : 0.62), hw * (near ? 2.6 : 1.7), clamp((y - plat) / (base - plat), 0, 1));
      for (const near of [false, true]) for (const side of [-1, 1]) L.seg(legX(side, near, base), base, legX(side, near, plat), plat, Math.max(2, near ? s(7) : s(5)), wood, near ? (side < 0 ? 0.8 : 0.42) : 0.22);
      for (let y = plat + s(40); y < base - s(10); y += s(62)) {
        const y2 = Math.min(base, y + s(46));
        L.seg(legX(-1, true, y), y, legX(1, true, y2), y2, Math.max(1, s(3)), wood, 0.55); L.seg(legX(1, true, y), y, legX(-1, true, y2), y2, Math.max(1, s(3)), wood, 0.38);
        L.rect(legX(-1, true, y2), y2 - s(1), legX(1, true, y2) - legX(-1, true, y2), s(3), wood, 0.5);
      }
      // the ladder up the middle
      for (const sx of [-1, 1]) L.seg(tx + sx * s(7), base, tx + sx * s(5), plat, Math.max(1, s(2)), wood, sx < 0 ? 0.7 : 0.4);
      for (let y = plat + s(8); y < base; y += s(10)) { const f = (y - plat) / (base - plat), a = lerp(s(5), s(7), f); L.rect(tx - a, y, a * 2, Math.max(1, s(1.5)), wood, 0.62); }
      // the platform seen from below, its railing; the posts up to the little roof
      L.rect(tx - hw * 1.05, plat - s(5), hw * 2.1, s(7), wood, (x, y) => (y < plat - s(4) ? 0.55 : 0.28));
      for (const sx of [-1, 1]) L.rect(tx + sx * hw * 0.98 - s(2), top + s(18), s(4), plat - top - s(18), wood, sx < 0 ? 0.72 : 0.35);
      L.rect(tx - hw, plat - s(16), hw * 2, s(2), wood, 0.6);
      L.poly([[tx - hw * 1.35, top + s(20)], [tx, top], [tx + hw * 1.35, top + s(20)], [tx + hw * 1.25, top + s(24)], [tx - hw * 1.25, top + s(24)]], roof, (x, y) => (y > top + s(19) ? 0.2 : x < tx ? 0.75 : 0.4));
      // the bell (hanshō), green bronze, hanging under the roof
      const bell = p.mat('#5a7a5a', { n: 6, at: 3, step: 0.09 }), by0 = top + s(24), by1 = plat - s(18);
      L.fill(tx - s(16), by0, tx + s(16), by1, (x, y) => Math.abs(x - tx) <= s(7) + (y - by0) * 0.38, bell, p.cyl(tx - s(3), s(14), { amb: 0.22 }));
      L.rect(tx - Math.round(s(7) + (by1 - by0) * 0.38) - 1, by1 - s(2), Math.round(s(14) + (by1 - by0) * 0.76) + 2, s(2), bell, 1);
      L.rect(tx - s(1), by0 - s(4), s(2), s(4), wood, 0.3);
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv, ropeY: by1 };
    });
  }
  const rope = {
    phases: [['look', 1400]],
    safe: { wide: 'the lookout, the bell and the rope above the sheet', narrow: 'the tower up the frame, the bell near the top', land: 'the bell and the top of the rope' },
    draw(c, w, h, t, st) {
      const G = geomRope(w, h, st.vb), { s, tx, fy } = G, still = st.still;
      const S0 = ropeStatic(G);
      c.drawImage(S0.cv, 0, 0);
      // the new rope: fresh pale hemp, twisted, from the bell down past the ladder; its swing settles
      const k = st.at('look');
      const sw = still ? 0 : (1 - ease(k)) * Math.sin(t / 300) * s(12) + Math.sin(t / 1500) * s(1.2);
      const y0 = S0.ropeY, y1 = fy + s(20), rw = Math.max(2, s(3));
      for (let y = y0; y < y1; y++) {
        const f = (y - y0) / (y1 - y0), x = Math.round(tx + s(3) + sw * f * f);
        R(c, x - 1, y, rw, 1, (Math.floor(y / 2) % 2) ? '#e6d29e' : '#cdb47a'); R(c, x - 1, y, 1, 1, '#f4e6be');
      }
      // heads and shoulders along the bottom from behind; one by one they look up at it
      const who = ['co_goro', 'co_ume', 'co_heita', 'co_sayo', 'co_tamotsu'];
      const sc = clamp(G.Z, 0.5, 1);
      who.forEach((id, i) => {
        const x = Math.round(lerp(w * 0.14, w * 0.86, i / (who.length - 1)) + (i === 2 ? s(30) : 0)), up = k > 0.12 + i * 0.16;
        put(c, fig(look(id), 'up', up && i % 2 ? 'p:shadeeyes' : 'i0', sc, NOON), x, fy + (i % 2 ? s(6) : 0) - (up ? 1 : 0));
      });
    },
    focus(w, h, vb) { const G = geomRope(w, h, vb); return { x: G.tx - G.hw * 1.35, y: G.top, w: G.hw * 2.7, h: Math.min(vb - 2, G.plat + G.s(30)) - G.top }; },
  };

  RB.sequence.define('ch3.firebreaks', {
    title: { en: 'The firebreaks cut', jp: '{火除|ひよ}け{道|みち} を {刈|か}る' }, chapter: 3, scene: 'co.festival_begin',
    shots: { climb, gate, breaks, rope },
  });
})();
