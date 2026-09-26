// Wayfarer's Folio colour tokens: WCAG contrast of the pairs the interface
// actually uses (text 4.5:1, large text / UI state and edges 3:1), read from
// src/styles/00_tokens.css so the check follows the real values.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function tokens(css, selector) {
  const i = css.indexOf(selector + ' {');
  const block = css.slice(i, css.indexOf('}', i));
  const out = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) out[m[1]] = m[2];
  return out;
}
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export default async function (t) {
  const css = fs.readFileSync(path.join(root, 'src/styles/00_tokens.css'), 'utf8');
  const base = tokens(css, ':root');
  const hc = Object.assign({}, base, tokens(css, 'body.high-contrast'));
  // [foreground, background, minimum, what]
  const pairs = [
    ['ink', 'paper', 4.5, 'body text on a page'],
    ['ink-2', 'paper', 4.5, 'secondary text on a page'],
    ['ink-3', 'paper', 4.5, 'muted labels on a page'],
    ['rt-ink', 'paper', 4.5, 'furigana on a page'],
    ['ink', 'paper-2', 4.5, 'text on a tucked tab / slip'],
    ['ink-2', 'paper-3', 4.5, 'inactive tab label'],
    ['ink-3', 'paper-2', 4.5, 'muted text on a note slip'],
    ['river', 'paper', 4.5, 'links on a page'],
    ['danger-ink', 'danger-bg', 4.5, 'destructive action label'],
    ['danger-ink', 'paper', 4.5, 'danger text on a page'],
    ['ok-ink', 'paper', 4.5, 'success text on a page'],
    ['warn-ink', 'paper', 4.5, 'warning text on a page'],
    ['ribbon-deep', 'paper', 4.5, 'current-quest kind label'],
    ['on-cloth', 'cloth-800', 4.5, 'text on the cover'],
    ['on-cloth-2', 'cloth-800', 4.5, 'secondary text on the cover'],
    ['on-cloth', 'cloth-700', 4.5, 'cloth button label'],
    ['on-cloth', 'cloth-900', 4.5, 'text on the darkest cloth'],
    ['focus-cloth', 'cloth-800', 3, 'focus ring on cloth'],
    ['focus-paper', 'paper', 3, 'focus ring on paper'],
    ['ribbon', 'cloth-800', 3, 'ribbon marker against the cover'],
    ['ink-3', 'paper-3', 3, 'switch/radio outline on a tucked surface'],
    ['vermilion', 'paper', 3, 'you-are-here mark on the chart'],
  ];
  for (const [set, name] of [[base, 'default'], [hc, 'high contrast']]) {
    for (const [f, b, min, what] of pairs) {
      const r = ratio(set[f], set[b]);
      t.ok(set[f] && set[b] && r >= min, `${name}: ${what} (--${f} on --${b}) ${r.toFixed(2)}:1 ≥ ${min}`);
    }
  }
  // a page or tab is distinguishable from the cover by its edge or by its own fill
  for (const [set, name] of [[base, 'default'], [hc, 'high contrast']]) {
    for (const fill of ['paper', 'paper-3']) {
      const r = Math.max(ratio(set['paper-edge'], set['cloth-800']), ratio(set[fill], set['cloth-800']));
      t.ok(r >= 3, `${name}: --${fill} sheet boundary against the cover ${r.toFixed(2)}:1 ≥ 3`);
    }
    // inputs on paper (radio/option borders use --paper-edge; switches use --ink-3)
    t.ok(ratio(set['ink-3'], set.paper) >= 3, `${name}: control outlines on paper`);
  }
  // high contrast must be at least as strong as the default for body text
  t.ok(ratio(hc.ink, hc.paper) >= ratio(base.ink, base.paper), 'high contrast raises body-text contrast');
}
