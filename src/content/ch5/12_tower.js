/* Chapter 5: the submerged bell tower (沈んだ鐘楼) and Lanternfall's custom
 * props, overworld creature sprites and battle art.
 * The tower is entered from the top (the belfry loft sits just above the
 * lake) and explored downwards; reading each gate plate correctly drains the
 * next level until the drowned bell can be reached and rung. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const TS = 16;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

  // ---- custom props ---------------------------------------------------------------------------
  const P = RB.props.P;
  const def = (id, props, draw) => { P[id] = Object.assign({ id, w: 1, h: 1, block: true }, props, { draw }); };

  // Iron grate in the canal embankment: something hums underneath, going uphill.
  def('lf_grate', { block: false, light: 10 }, (c, x, y, p, t, o) => {
    px(c, x + 2, y + 4, 12, 9, '#2a2838');
    for (let i = 0; i < 5; i++) px(c, x + 3 + i * 2 + (i > 2 ? 1 : 0), y + 5, 1, 7, '#6a6880');
    px(c, x + 2, y + 4, 12, 1, '#8a88a0');
    const a = o.still ? 0.4 : (Math.sin(t / 500 + x) + 1) / 2;
    c.fillStyle = `rgba(150,170,240,${0.15 + a * 0.3})`;
    c.fillRect(x + 4, y + 7 - ((t / 300) % 3 | 0), 8, 2);
  });
  // A sluice wheel on a post. o.shut draws the wheel turned.
  def('lf_wheel', {}, (c, x, y, p, t, o) => {
    RB.props.shadow(c, x, y, 16);
    px(c, x + 7, y + 4, 2, 11, p.wood[2]);
    c.strokeStyle = o.shut ? '#b89a58' : '#7a6a4a'; c.lineWidth = 2;
    c.beginPath(); c.arc(x + 8, y + 2, 6, 0, Math.PI * 2); c.stroke();
    const a = (o.shut ? Math.PI / 4 : 0);
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const an = a + i * Math.PI / 2; c.beginPath(); c.moveTo(x + 8, y + 2); c.lineTo(x + 8 + Math.cos(an) * 6, y + 2 + Math.sin(an) * 6); c.stroke(); }
    px(c, x + 7, y + 1, 2, 2, '#3a3440');
  });
  // A lever / plug handle set into the floor. o.pulled tips it over.
  def('lf_lever', {}, (c, x, y, p, t, o) => {
    RB.props.shadow(c, x, y, 16);
    px(c, x + 3, y + 10, 10, 5, p.stone[2]);
    px(c, x + 4, y + 10, 8, 1, p.stone[1]);
    c.save(); c.translate(x + 8, y + 11); c.rotate(o.pulled ? 0.9 : -0.2);
    px(c, -1, -12, 2, 12, '#6a5a4a');
    px(c, -3, -15, 6, 4, o.col || '#a8784a');
    c.restore();
  });
  // A bronze instruction plate fixed to a wall or post.
  def('lf_plate', {}, (c, x, y, p) => {
    px(c, x + 7, y + 8, 2, 7, p.stone[2]);
    px(c, x + 1, y - 1, 14, 10, '#6a5a2a');
    px(c, x + 2, y, 12, 8, '#b8984a');
    for (let r = 0; r < 3; r++) px(c, x + 4, y + 2 + r * 2, 8 - (r === 2 ? 3 : 0), 1, '#6a5020');
  });
  // Dynamic floodwater laid over a tile; blocks while present.
  def('lf_flood', { light: 0 }, (c, x, y, p, t, o) => {
    px(c, x, y, TS, TS, p.water[0]);
    const k = o.still ? 0 : ((t / 700 + (o.cx * 3 + o.cy * 5)) % 4);
    px(c, x + ((o.cx * 5 + (k | 0) * 3) % 11), y + 4 + (o.cy % 3) * 3, 4, 1, p.water[1]);
    px(c, x + ((o.cy * 7 + 3) % 12), y + 11, 3, 1, p.water[2]);
  });
  // The hush conduit: an old pipe; faint motes travel up it.
  def('lf_conduit', { light: 14 }, (c, x, y, p, t, o) => {
    px(c, x + 4, y - 8, 8, 24, '#3a3850');
    px(c, x + 4, y - 8, 2, 24, '#5a5878');
    px(c, x + 3, y - 8, 10, 2, '#6a6888');
    px(c, x + 3, y + 12, 10, 2, '#2a2838');
    if (!o.still) for (let i = 0; i < 3; i++) {
      const ph = ((t / 900 + i / 3 + o.cy * 0.13) % 1);
      c.fillStyle = `rgba(190,200,255,${0.7 - ph * 0.6})`;
      c.fillRect(x + 7, y + 10 - ph * 20, 2, 2);
    }
  });
  // Sluice gate boards across the outlet channel (5 tiles wide).
  def('lf_sluicegate', { w: 5 }, (c, x, y, p) => {
    px(c, x, y + 1, 80, 13, p.wood[2]);
    for (let i = 0; i < 80; i += 8) px(c, x + i, y + 2, 7, 11, p.wood[1]);
    px(c, x, y + 1, 80, 1, p.wood[3]);
    for (const i of [0, 38, 76]) px(c, x + i, y - 6, 4, 22, p.stone[2]);
    px(c, x, y + 13, 80, 2, 'rgba(0,0,0,0.25)');
  });
  // The drowned bell tower, seen from the shore: only its belfry clears the lake.
  def('lf_sunktower', { w: 3, h: 3 }, (c, x, y, p, t, o) => {
    const W = 48;
    px(c, x + 4, y - 18, W - 8, 62, p.stone[0]);
    px(c, x + 4, y - 18, 3, 62, p.stone[1]);
    px(c, x + W - 7, y - 18, 3, 62, p.stone[2]);
    for (let r = 0; r < 8; r++) px(c, x + 4, y - 14 + r * 7, W - 8, 1, p.stone[2]);
    // belfry arch with the bell's shadow inside
    px(c, x + 14, y - 10, 20, 22, '#141828');
    c.fillStyle = '#141828'; c.beginPath(); c.arc(x + 24, y - 10, 10, Math.PI, 0); c.fill();
    c.fillStyle = o.rung ? '#b8984a' : '#4a5a4a';
    c.beginPath(); c.moveTo(x + 20, y - 8); c.lineTo(x + 28, y - 8); c.lineTo(x + 31, y + 6); c.lineTo(x + 17, y + 6); c.closePath(); c.fill();
    // roof
    c.fillStyle = '#2a2848';
    c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 24, y - 38); c.lineTo(x + W, y - 18); c.fill();
    px(c, x, y - 19, W, 2, '#4c4a78');
    // water line and ripples
    px(c, x, y + 30, W, 18, p.water[0]);
    const k = o.still ? 0 : Math.sin(t / 600) * 2;
    px(c, x + 2 + k, y + 30, W - 4, 1, p.water[3]);
    px(c, x + 8 - k, y + 34, W - 16, 1, p.water[2]);
  });
  // The drowned bell itself (2×2), hanging from a charred beam.
  def('lf_bigbell', { w: 2, h: 2 }, (c, x, y, p, t, o) => {
    px(c, x - 2, y - 12, 36, 4, '#3a2e2a');
    px(c, x + 15, y - 8, 2, 6, '#3a2e2a');
    const sw = o.rung && !o.still ? Math.sin(t / 300) * 1.5 : 0;
    const body = o.rung ? '#b8984a' : '#5a6a52';
    c.fillStyle = body;
    c.beginPath(); c.moveTo(x + 8 + sw, y - 2); c.lineTo(x + 24 + sw, y - 2); c.lineTo(x + 30 + sw, y + 22); c.lineTo(x + 2 + sw, y + 22); c.closePath(); c.fill();
    px(c, x + 2 + sw, y + 20, 28, 3, o.rung ? '#d8b860' : '#6a7a5a');
    px(c, x + 10 + sw, y + 2, 2, 16, o.rung ? '#e8d890' : '#7a8a6a');
    if (!o.rung) { px(c, x + 5, y + 12, 3, 5, '#3a6a4a'); px(c, x + 22, y + 6, 4, 3, '#3a6a4a'); }
    px(c, x + 14 + sw, y + 23, 4, 4, '#3a3020');
  });

  // ---- overworld creature sprites (16×24) ---------------------------------------------------------------
  const SP = RB.sprites.custom;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  SP.lf_bell = (c, look, d, f) => {
    const col = look.col || '#3c5c8a';
    const b = f === 1 ? 1 : 0;
    R(c, 5, 6 + b, 6, 2, col); R(c, 4, 8 + b, 8, 6, col); R(c, 3, 14 + b, 10, 2, col);
    R(c, 7, 16 + b, 2, 2, '#1a2030');
    R(c, 5, 10 + b, 1, 2, '#e8ecff'); R(c, 10, 10 + b, 1, 2, '#e8ecff');
    c.fillStyle = col + '70'; c.fillRect(4, 18 + b, 2, 4); c.fillRect(10, 19 - b, 2, 3);
  };
  SP.lf_stamp = (c, look, d, f) => {
    const col = look.col || '#4c4a78';
    R(c, 6, 3, 4, 6, '#6a4a3a'); R(c, 5, 2, 6, 2, '#8a6a4a');
    R(c, 3, 9, 10, 9, col); R(c, 3, 9, 10, 1, '#8a88c0');
    R(c, 2, 18, 12, 3, '#c85a4a');
    R(c, 5, 12, 2, 2, '#f0f0ff'); R(c, 9, 12, 2, 2, '#f0f0ff');
    R(c, 4 + (f === 1 ? 1 : 0), 21, 2, 2, col); R(c, 10 - (f === 1 ? 1 : 0), 21, 2, 2, col);
  };
  SP.lf_pipe = (c, look, d, f) => {
    const col = look.col || '#8a90c8';
    R(c, 6, 4, 4, 18, '#3a3850'); R(c, 6, 4, 1, 18, '#5a5878');
    for (let i = 0; i < 3; i++) { c.fillStyle = col; c.fillRect(7, 18 - i * 6 - (f === 1 ? 2 : 0), 2, 2); }
    R(c, 3, 8, 3, 2, '#3a3850'); R(c, 10, 13, 3, 2, '#3a3850');
    R(c, 6, 6, 1, 1, '#f0f0ff'); R(c, 9, 6, 1, 1, '#f0f0ff');
  };

  // ---- battle art (≈64px, centred) ---------------------------------------------------------------------
  const A = RB.enemyArt.A;
  const circ = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  A.lf_conduit = (c, t, o) => {
    const col = o.col || '#8a90c8';
    const s = Math.sin(t / 500) * 3;
    c.fillStyle = '#3a3850';
    c.beginPath(); c.moveTo(-8, 40); c.quadraticCurveTo(-26 + s, 10, -6, -8); c.quadraticCurveTo(14, -26, 4, -40); c.lineTo(14, -40); c.quadraticCurveTo(26, -24, 6, -4); c.quadraticCurveTo(-12 + s, 12, 4, 40); c.closePath(); c.fill();
    c.strokeStyle = '#5a5878'; c.lineWidth = 2; c.stroke();
    for (let i = 0; i < 6; i++) {
      const ph = ((t / 1200) + i / 6) % 1;
      circ(c, -4 + Math.sin(ph * 6) * 8, 36 - ph * 74, 3, col + (ph < 0.8 ? 'd0' : '60'));
    }
    c.fillStyle = '#f0f0ff'; c.fillRect(-2, -30, 3, 3); c.fillRect(6, -31, 3, 3);
  };
  A.lf_keeper = (c, t, o) => {
    const sw = Math.sin(t / 700) * 0.08;
    const drip = (t / 40) % 30;
    // conduit tendrils behind
    c.strokeStyle = '#3a3850'; c.lineWidth = 5;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-20 + i * 13, 10); c.quadraticCurveTo(-40 + i * 26 + Math.sin(t / 400 + i) * 6, 30, -30 + i * 20, 48); c.stroke(); }
    c.save(); c.rotate(sw);
    c.fillStyle = o.col || '#4a5a52';
    c.beginPath(); c.moveTo(-18, -34); c.lineTo(18, -34); c.lineTo(30, 18); c.lineTo(-30, 18); c.closePath(); c.fill();
    c.fillStyle = '#6a7a62'; c.fillRect(-30, 14, 60, 5);
    c.fillStyle = '#2a3a34'; c.fillRect(-12, -30, 3, 40);
    // sluice-plate face
    c.fillStyle = '#b8984a'; c.fillRect(-12, -18, 24, 16);
    c.fillStyle = '#6a5020'; c.fillRect(-9, -15, 18, 1); c.fillRect(-9, -11, 18, 1); c.fillRect(-9, -7, 12, 1);
    c.fillStyle = '#e8ecff'; c.fillRect(-7, -24, 4, 3); c.fillRect(4, -24, 4, 3);
    c.restore();
    circ(c, 0, 24, 6, '#2a3020');
    c.fillStyle = 'rgba(160,190,230,0.7)'; c.fillRect(-22, 20 + drip, 2, 4); c.fillRect(20, 20 + ((drip + 13) % 30), 2, 4);
  };

  // ---- tower maps ---------------------------------------------------------------------------------------
  const TOWER = { region: 'lanternfall', music: 'belltower', noTravel: true };
  const flood = (cells, cond) => cells.map(([x, y]) => ({ p: 'lf_flood', x, y, if: cond }));
  const rect = (x0, y0, w, h) => { const out = []; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) out.push([x, y]); return out; };

  C.maps['lf.tower_top'] = Object.assign({}, TOWER, {
    name: T('Belfry Loft', '{鐘楼|しょうろう} の {屋根裏|やねうら}'),
    ambient: { dark: 0.45, playerLight: 52, tint: 'rgba(40,60,120,0.12)' },
    terrain: K.build(16, 12, '#', (k) => {
      k.rect(1, 2, 14, 8, '_');
      k.rect(2, 8, 3, 2, 'w');
      k.set(7, 10, '_').set(7, 11, '_').set(8, 10, '_');
    }),
    props: [
      { p: 'noticeboard', x: 2, y: 2, scene: 'lf.roster' },
      { p: 'stairs', x: 12, y: 3 },
      { p: 'ladder', x: 5, y: 3, scene: 'lf.trapdoor', if: '!lf_shortcut' },
      { p: 'ladder', x: 5, y: 3, if: 'lf_shortcut' },
      { p: 'hole', x: 9, y: 6 }, { p: 'crate', x: 13, y: 8 }, { p: 'barrel', x: 1, y: 5 },
      { p: 'lantern', x: 10, y: 2, o: { lit: true } },
      { p: 'lf_plate', x: 8, y: 2, scene: 'lf.top_plate' },
    ],
    exits: [
      { x: 7, y: 11, to: 'lf.sluice', sp: 'from_tower', dir: 'down' },
      { x: 12, y: 3, to: 'lf.tower_upper', tx: 16, ty: 3, dir: 'down' },
      { x: 5, y: 3, to: 'lf.tower_mid', tx: 3, ty: 4, dir: 'down', if: 'lf_shortcut' },
    ],
    onEnter: [{ scene: 'lf.tower_arrive', if: '!lf_tower_entered' }],
    spawn: { default: [7, 9, 'up'] },
  });

  C.maps['lf.tower_upper'] = Object.assign({}, TOWER, {
    name: T('Upper Floor', '{上|うえ} の {階|かい}'),
    ambient: { dark: 0.5, playerLight: 50, tint: 'rgba(40,60,120,0.12)' },
    terrain: K.build(20, 16, '#', (k) => {
      k.rect(1, 2, 18, 13, '+');
      k.rect(6, 6, 8, 5, 'w');
      k.rect(8, 7, 4, 3, '~');
      k.rect(8, 11, 5, 4, 'w');
      k.set(10, 15, 'w');
      k.rect(1, 12, 3, 3, 'w');
    }),
    props: [
      { p: 'stairs', x: 16, y: 2 },
      { p: 'lf_plate', x: 5, y: 2, scene: 'lf.plate_a' },
      { p: 'lf_wheel', x: 2, y: 5, scene: 'lf.wheel_upper', if: '!lf_up_closed' },
      { p: 'lf_wheel', x: 2, y: 5, scene: 'lf.wheel_upper', o: { shut: true }, if: 'lf_up_closed' },
      { p: 'lf_wheel', x: 17, y: 9, scene: 'lf.wheel_lower', if: '!lf_gate_a' },
      { p: 'lf_wheel', x: 17, y: 9, scene: 'lf.wheel_lower', o: { shut: true }, if: 'lf_gate_a' },
      { p: 'pillar', x: 4, y: 9 }, { p: 'pillar', x: 15, y: 12 },
      { p: 'bookpile', x: 17, y: 13, scene: 'lf.upper_logs' },
      { p: 'crate', x: 1, y: 2 },
    ].concat(flood(rect(8, 11, 5, 4).concat([[10, 15]]), '!lf_gate_a')),
    foes: [
      { id: 'tu1', enemy: 'lf.blot', x: 14, y: 5, patrol: 2, aggro: true },
      { id: 'tu2', enemy: 'lf.mote', x: 4, y: 12, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 16, y: 1, to: 'lf.tower_top', tx: 12, ty: 4, dir: 'up' },
      { x: 10, y: 15, to: 'lf.tower_mid', tx: 10, ty: 2, dir: 'down', if: 'lf_gate_a' },
    ],
    spawn: { default: [16, 3, 'down'] },
  });
  // the stairwell up is a gap in the top wall
  C.maps['lf.tower_upper'].terrain = C.maps['lf.tower_upper'].terrain.map((row, y) => (y === 1 ? row.slice(0, 16) + '+' + row.slice(17) : row));

  C.maps['lf.tower_mid'] = Object.assign({}, TOWER, {
    name: T('Gate Works', '{水門|すいもん} の {機械室|きかいしつ}'),
    ambient: { dark: 0.5, playerLight: 50, tint: 'rgba(40,60,120,0.14)' },
    terrain: K.build(22, 18, '#', (k) => {
      k.rect(1, 2, 20, 15, '+');
      k.set(10, 1, '+');
      k.rect(1, 10, 20, 6, 'w');
      k.rect(10, 16, 2, 1, 'w');
      k.set(10, 17, 'w');
    }),
    props: [
      { p: 'gears', x: 6, y: 2, scene: 'lf.gears' }, { p: 'gears', x: 13, y: 2 },
      { p: 'lf_plate', x: 9, y: 3, scene: 'lf.plate_b' },
      { p: 'ladder', x: 3, y: 3, scene: 'lf.ladder_mid' },
      { p: 'lf_conduit', x: 19, y: 3, scene: 'lf.junction' }, { p: 'lf_conduit', x: 19, y: 4, scene: 'lf.junction' }, { p: 'lf_conduit', x: 19, y: 5, scene: 'lf.junction' },
      { p: 'lf_conduit', x: 18, y: 5, scene: 'lf.junction' },
      { p: 'lf_lever', x: 20, y: 8, scene: 'lf.east_door', o: { col: '#6a8ab8' }, if: '!lf_east_open' },
      { p: 'lf_lever', x: 20, y: 8, scene: 'lf.east_door', o: { col: '#6a8ab8', pulled: true }, if: 'lf_east_open' },
      { p: 'lf_lever', x: 1, y: 8, scene: 'lf.west_plug', o: { col: '#a8784a' }, if: '!lf_mid_drained' },
      { p: 'lf_lever', x: 1, y: 8, scene: 'lf.west_plug', o: { col: '#a8784a', pulled: true }, if: 'lf_mid_drained' },
      { p: 'pillar', x: 5, y: 7 }, { p: 'pillar', x: 16, y: 7 },
      { p: 'echo', x: 17, y: 4, if: '!lf_koe' },
    ].concat(flood(rect(1, 10, 20, 6).concat([[10, 16], [11, 16], [10, 17]]), '!lf_mid_drained')),
    foes: [
      { id: 'tm1', enemy: 'lf.conduit', x: 14, y: 6, patrol: 1, aggro: true },
      { id: 'tm2', enemy: 'lf.conduit', x: 7, y: 8, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 10, y: 1, to: 'lf.tower_upper', tx: 10, ty: 14, dir: 'up' },
      { x: 10, y: 17, to: 'lf.tower_low', tx: 10, ty: 2, dir: 'down', if: 'lf_gate_b' },
      { x: 3, y: 3, to: 'lf.tower_top', tx: 5, ty: 4, dir: 'up', if: 'lf_shortcut' },
    ],
    triggers: [
      { x: 1, y: 10, w: 20, h: 1, scene: 'lf.water_returns', if: 'lf_mid_drained&!lf_gate_b' },
    ],
    onEnter: [{ scene: 'lf.mid_enter', if: '!lf_mid_seen' }],
    spawn: { default: [10, 2, 'down'] },
  });

  C.maps['lf.tower_low'] = Object.assign({}, TOWER, {
    name: T('Drowned Stair', '{沈|しず}んだ {階段|かいだん}'),
    ambient: { dark: 0.58, playerLight: 48, tint: 'rgba(30,50,110,0.16)' },
    terrain: K.build(20, 18, '#', (k) => {
      k.rect(1, 2, 18, 15, '+');
      k.set(10, 1, '+');
      k.rect(6, 8, 8, 9, '~');
      k.rect(9, 8, 2, 9, 'w');
      k.set(10, 17, 'w');
      k.rect(1, 12, 4, 4, 'w');
      k.rect(15, 12, 4, 4, 'w');
    }),
    props: [
      { p: 'lf_plate', x: 3, y: 2, scene: 'lf.plate_c' },
      { p: 'lf_lever', x: 2, y: 14, scene: 'lf.south_plug', o: { col: '#a8784a' }, if: '!lf_south_pulled' },
      { p: 'lf_lever', x: 2, y: 14, scene: 'lf.south_plug', o: { col: '#a8784a', pulled: true }, if: 'lf_south_pulled' },
      { p: 'lf_lever', x: 16, y: 3, scene: 'lf.north_plug', o: { col: '#6a8ab8' }, if: '!lf_gate_c' },
      { p: 'lf_lever', x: 16, y: 3, scene: 'lf.north_plug', o: { col: '#6a8ab8', pulled: true }, if: 'lf_gate_c' },
      { p: 'pillar', x: 14, y: 5, scene: 'lf.toya_scratch' }, { p: 'pillar', x: 5, y: 5 },
      { p: 'deadlantern', x: 17, y: 9 },
    ].concat(flood(rect(9, 8, 2, 9).concat([[10, 17]]), '!lf_gate_c')),
    foes: [
      { id: 'tl1', enemy: 'lf.wraith', x: 4, y: 8, patrol: 1, aggro: true },
      { id: 'tl2', enemy: 'lf.wraith', x: 16, y: 11, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 10, y: 1, to: 'lf.tower_mid', tx: 10, ty: 16, dir: 'up' },
      { x: 10, y: 17, to: 'lf.bellhall', tx: 8, ty: 2, dir: 'down', if: 'lf_gate_c' },
    ],
    onEnter: [{ scene: 'lf.low_enter', if: '!lf_low_seen' }],
    spawn: { default: [10, 2, 'down'] },
  });

  C.maps['lf.bellhall'] = Object.assign({}, TOWER, {
    name: T('Bell Chamber', '{鐘|かね} の {間|ま}'),
    music: [{ if: 'lf_bell_rung', id: 'wonder' }, { id: 'hush' }],
    ambient: { dark: 0.5, playerLight: 50, tint: 'rgba(30,50,110,0.16)' },
    terrain: K.build(16, 14, '#', (k) => {
      k.rect(1, 2, 14, 11, 'w');
      k.set(8, 1, '+');
      k.rect(5, 6, 6, 5, '+');
      k.rect(1, 2, 14, 2, '+');
    }),
    props: [
      { p: 'lf_bigbell', x: 7, y: 7, scene: 'lf.bell_touch', if: '!lf_bell_rung' },
      { p: 'lf_bigbell', x: 7, y: 7, o: { rung: true }, scene: 'lf.bell_after', if: 'lf_bell_rung' },
      { p: 'pillar', x: 3, y: 5 }, { p: 'pillar', x: 12, y: 5 }, { p: 'pillar', x: 3, y: 10 }, { p: 'pillar', x: 12, y: 10 },
      { p: 'lf_conduit', x: 1, y: 7 }, { p: 'lf_conduit', x: 14, y: 7 },
      { p: 'lf_plate', x: 10, y: 6, scene: 'lf.bell_plate' },
    ],
    exits: [{ x: 8, y: 1, to: 'lf.tower_low', tx: 10, ty: 16, dir: 'up' }],
    triggers: [{ x: 1, y: 5, w: 14, h: 1, scene: 'lf.boss_intro', if: '!lf_boss_done' }],
    spawn: { default: [8, 2, 'down'] },
  });
})(RB.content, RB.mapkit);
