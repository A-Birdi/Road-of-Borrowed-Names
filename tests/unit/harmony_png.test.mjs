// The Harmony importer's PNG codec (tools/harmony/png.mjs, node:zlib only): round trips for every colour type it
// writes, every row filter, 16-bit and tRNS images it only reads, iTXt text, and the refusals (bad signature, CRC,
// interlaced files, truncation).
import zlib from 'node:zlib';
import { decodePNG, encodePNG, crc32, PNGError } from '../../tools/harmony/png.mjs';

const img = (w, h, f) => { const d = new Uint8Array(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d.set(f(x, y), 4 * (y * w + x)); return { w, h, data: d }; };
const same = (a, b) => a.w === b.w && a.h === b.h && a.data.length === b.data.length && a.data.every((v, i) => v === b.data[i]);
const throwsLike = (fn, re) => { try { fn(); return false; } catch (e) { return e instanceof PNGError && re.test(e.message); } };
function chunk(type, data) {
  const b = Buffer.alloc(12 + data.length);
  b.writeUInt32BE(data.length, 0); b.write(type, 4, 'latin1'); data.copy(b, 8);
  b.writeUInt32BE(crc32(b, 4, 8 + data.length), 8 + data.length);
  return b;
}
const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function rawPNG(w, h, depth, type, rows, extra = []) {
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = depth; ih[9] = type;
  return Buffer.concat([SIG, chunk('IHDR', ih), ...extra, chunk('IDAT', zlib.deflateSync(Buffer.concat(rows.map((r) => Buffer.concat([Buffer.from([0]), r]))))), chunk('IEND', Buffer.alloc(0))]);
}

export default async (t) => {
  // RGBA8 with every alpha, each forced filter and the adaptive choice
  const a = img(37, 23, (x, y) => [(x * 7) & 255, (y * 11) & 255, (x * y) & 255, (x + y) % 3 ? 255 : (x * 13) & 255]);
  for (const filter of [0, 1, 2, 3, 4, undefined]) t.ok(same(decodePNG(encodePNG(a, { filter })), a), 'RGBA8 round trip, filter ' + (filter == null ? 'adaptive' : filter));
  // RGB8: alpha dropped (opaque)
  const rgbIn = img(19, 9, (x, y) => [x * 9, y * 20, 200, 255]);
  const rgb = decodePNG(encodePNG(rgbIn, { colorType: 2 }));
  t.ok(same(rgb, rgbIn) && rgb.info.colorType === 2, 'RGB8 round trip');
  // grey and grey + alpha
  const g = img(16, 4, (x) => [x * 16, x * 16, x * 16, 255]);
  t.ok(same(decodePNG(encodePNG(g, { colorType: 0 })), g), 'grey 8 round trip');
  const ga = img(16, 4, (x, y) => [x * 16, x * 16, x * 16, y * 60]);
  t.ok(same(decodePNG(encodePNG(ga, { colorType: 4 })), ga), 'grey + alpha 8 round trip');
  for (const bd of [1, 2, 4]) {
    const lv = (1 << bd) - 1, gi = img(13, 3, (x) => { const v = Math.round(((x % (lv + 1)) * 255) / lv); return [v, v, v, 255]; });
    t.ok(same(decodePNG(encodePNG(gi, { colorType: 0, bitDepth: bd })), gi), 'grey ' + bd + '-bit round trip (odd width)');
  }
  // palette at 1, 2, 4, 8 bits, with transparency
  for (const bd of [1, 2, 4, 8]) {
    const n = Math.min(1 << bd, 6), pal = [[0, 0, 0, 0], [255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 128], [255, 255, 0, 255], [9, 9, 9, 255]].slice(0, n);
    const p = img(11, 5, (x, y) => pal[(x + y) % n]);
    const d = decodePNG(encodePNG(p, { colorType: 3, bitDepth: bd }));
    t.ok(same(d, p) && d.info.colorType === 3 && d.info.bitDepth === bd, 'palette ' + bd + '-bit round trip with tRNS');
  }
  // iTXt (UTF-8) text survives
  t.eq(decodePNG(encodePNG(a, { text: { Comment: 'SYNTHETIC SAMPLE — not art' } })).info.text, { Comment: 'SYNTHETIC SAMPLE — not art' }, 'iTXt comment round trip');
  // 16-bit RGBA and RGB with tRNS (read only): high byte kept; the transparent colour matched on the full 16 bits
  {
    const row = Buffer.from([0x12, 0x34, 0xab, 0xcd, 0x00, 0x01, 0xff, 0xff, 0xfe, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]);
    const d = decodePNG(rawPNG(2, 1, 16, 6, [row]));
    t.eq([...d.data], [0x12, 0xab, 0x00, 0xff, 0xfe, 0x00, 0x80, 0x00], '16-bit RGBA keeps the high byte');
    const trns = Buffer.from([0, 10, 0, 20, 0, 30]);
    const r2 = Buffer.from([0, 10, 0, 20, 0, 30, 0, 10, 0, 20, 0, 31]);
    const d2 = decodePNG(rawPNG(2, 1, 16, 2, [r2], [chunk('tRNS', trns)]));
    t.eq([d2.data[3], d2.data[7]], [0, 255], '16-bit RGB tRNS matches on the full sample');
    const d3 = decodePNG(rawPNG(3, 1, 8, 2, [Buffer.from([1, 2, 3, 4, 5, 6, 1, 2, 3])], [chunk('tRNS', Buffer.from([0, 1, 0, 2, 0, 3]))]));
    t.eq([d3.data[3], d3.data[7], d3.data[11]], [0, 255, 0], '8-bit RGB tRNS');
  }
  // refusals
  const good = encodePNG(a);
  t.ok(throwsLike(() => decodePNG(Buffer.from('not a png at all')), /signature/), 'a non-PNG is refused');
  const bad = Buffer.from(good); bad[40] ^= 0xff;
  t.ok(throwsLike(() => decodePNG(bad), /CRC|corrupt|truncated/), 'a damaged chunk is refused (CRC)');
  const inter = Buffer.from(good); inter[28] = 1; inter.writeUInt32BE(crc32(inter, 12, 29), 29);
  t.ok(throwsLike(() => decodePNG(inter), /interlaced \(Adam7\)/), 'an interlaced PNG is refused with a clear message');
  t.ok(throwsLike(() => decodePNG(good.subarray(0, 60)), /truncated/), 'a truncated file is refused');
  t.ok(throwsLike(() => encodePNG(img(2, 2, () => [1, 2, 3, 255]), { colorType: 3, bitDepth: 1, palette: [[0, 0, 0, 255]] }), /palette/), 'the encoder refuses a pixel missing from a given palette');
  // CRC of the PNG spec's own example ("IEND" with no data is AE 42 60 82)
  t.eq(crc32(Buffer.from('IEND', 'latin1')).toString(16), 'ae426082', 'CRC-32 matches the PNG specification');
};
