// A map as text, for placing people and things on it (RE-1): blocked tiles '#', open ground '.', water '~' (when the
// tile is blocked water), ways out 'E', people 'N', props by a letter (listed under the grid with their kinds and
// tiles), tiles out of reach from the map's spawn ' ' (open but unreachable). Conditional props and people are drawn
// too, marked in the list with their condition.
//   node tools/review/map_ascii.mjs <map id> [<map id> …]
import { load } from '../../tests/lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const C = RB.content;
const s = RB.state.newCampaign({ edition: 2 });
for (const id of process.argv.slice(2)) {
  if (!C.maps[id]) { console.log('no map ' + id); continue; }
  const m = RB.maps.compile(id);
  const grid = [];
  for (let y = 0; y < m.h; y++) { const row = []; for (let x = 0; x < m.w; x++) row.push(RB.maps.blockedStatic(m, x, y) ? '#' : '.'); grid.push(row); }
  // reach from the spawn (or the first open tile)
  const sp = (m.def.spawn && m.def.spawn.default) || null;
  let start = sp ? [sp[0], sp[1]] : null;
  if (!start) outer: for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (grid[y][x] === '.') { start = [x, y]; break outer; }
  const seen = new Set();
  if (start) {
    const q = [start]; seen.add(start.join(','));
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || seen.has(k) || grid[ny][nx] !== '.') continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (grid[y][x] === '.' && !seen.has(x + ',' + y)) grid[y][x] = ' ';
  }
  const legend = [];
  const L = 'abcdfghijklmopqrstuvwxyzABCDFGHIJKLMOPQRSTUVWXYZ0123456789';
  let li = 0;
  // scenery by a fixed mark (not listed): trees T, bushes *, rocks o, low growth ,
  const DECOR = { tree: 'T', pine: 'T', cedar: 'T', maple: 'T', bush: '*', shrub: '*', rock: 'o', boulder: 'o', stone: 'o', grass: ',', flowers: ',', reeds: ',', tuft: ',', weeds: ',' };
  const decorOf = (k) => DECOR[k] || (/tree|pine|cedar|maple|willow|bamboo/.test(k) ? 'T' : /bush|shrub|hedge/.test(k) ? '*' : /rock|boulder|stone(?!lantern)/.test(k) ? 'o' : /grass|flower|reed|tuft|weed|fern/.test(k) ? ',' : null);
  // (the development switches' props and people, never in ordinary play, are left out)
  const dev = (o) => /dev_/.test(o.if || '');
  for (const p of m.props || []) {
    if (dev(p)) continue;
    const dm = !p.scene && !p.if && !p.text ? decorOf(p.p) : null;
    if (dm) { const pd = RB.props.P[p.p] || {}; const w = p.w || pd.w || 1, h = p.h || pd.h || 1; for (let yy = p.y; yy < p.y + h && yy < m.h; yy++) for (let xx = p.x; xx < p.x + w && xx < m.w; xx++) if (yy >= 0 && xx >= 0) grid[yy][xx] = dm; continue; }
    const ch = L[li++ % L.length];
    const pd = RB.props.P[p.p] || {};
    const w = p.w || pd.w || 1, h = p.h || pd.h || 1;
    for (let yy = p.y; yy < p.y + h && yy < m.h; yy++) for (let xx = p.x; xx < p.x + w && xx < m.w; xx++) if (yy >= 0 && xx >= 0) grid[yy][xx] = ch;
    legend.push(ch + ' ' + p.p + ' @' + p.x + ',' + p.y + (w > 1 || h > 1 ? ' ' + w + 'x' + h : '') + (p.scene ? ' scene ' + p.scene : '') + (p.if ? ' if ' + p.if : ''));
  }
  for (const e of m.exits || []) for (let yy = e.y; yy < e.y + (e.h || 1); yy++) for (let xx = e.x; xx < e.x + (e.w || 1); xx++) if (grid[yy] && grid[yy][xx] != null) grid[yy][xx] = 'E';
  const people = [];
  for (const n of m.def.npcs || []) {
    if (dev(n)) continue; if (grid[n.y] && grid[n.y][n.x] != null) grid[n.y][n.x] = 'N'; people.push('N ' + n.id + (n.char ? ' (' + n.char + ')' : '') + ' @' + n.x + ',' + n.y + (n.if ? ' if ' + n.if : '')); }
  console.log('== ' + id + ' ' + m.w + 'x' + m.h + ' "' + ((m.def.name && m.def.name.en) || '') + '" spawn ' + JSON.stringify(sp));
  const tens = '    ' + Array.from({ length: m.w }, (_, x) => (x % 10 === 0 ? String(x / 10 % 10) : ' ')).join('');
  const ones = '    ' + Array.from({ length: m.w }, (_, x) => String(x % 10)).join('');
  console.log(tens + '\n' + ones);
  grid.forEach((r, y) => console.log(String(y).padStart(3) + ' ' + r.join('')));
  console.log('exits: ' + (m.exits || []).map((e) => e.to + '@' + e.x + ',' + e.y + (e.w > 1 ? ' w' + e.w : '') + (e.h > 1 ? ' h' + e.h : '')).join('; '));
  console.log(legend.join('\n'));
  console.log(people.join('\n'));
}
