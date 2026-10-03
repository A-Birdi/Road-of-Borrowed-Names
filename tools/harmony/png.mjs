// A small PNG decoder and encoder on node:zlib (no dependencies), for the Harmony art importer.
// decodePNG(buf) → { w, h, data: Uint8Array RGBA8 (straight alpha), info: { colorType, bitDepth, interlace, text } }
//   reads colour types 0 (grey), 2 (RGB), 3 (palette), 4 (grey + alpha) and 6 (RGBA) at every legal bit depth
//   (1/2/4/8/16; 16-bit keeps the high byte), tRNS transparency, tEXt/iTXt text; checks every chunk's CRC.
//   Interlaced (Adam7) files are refused with a clear error. Colour chunks (gAMA, iCCP, cHRM, sRGB) are ignored:
//   pixels are taken as sRGB.
// encodePNG({ w, h, data }, { colorType = 6, bitDepth = 8, palette, filter, text }) → Buffer
//   colorType 6 (RGBA8, the default), 2 (RGB8; alpha dropped), 0 / 4 (grey / grey + alpha, 8-bit; from the red
//   channel), 3 (palette at bitDepth 1/2/4/8; `palette` [[r, g, b, a], …] or built from the image). `filter`
//   0–4 forces one row filter (tests); default: per row, the filter with the smallest sum of absolute values.
//   `text`: { keyword: value } written as iTXt (UTF-8).
import zlib from 'node:zlib';

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(buf, start = 0, end = buf.length) { let c = 0xffffffff; for (let i = start; i < end; i++) c = CRC_T[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
const DEPTHS = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };

export class PNGError extends Error {}

export function decodePNG(buf) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIG)) throw new PNGError('not a PNG file (bad signature)');
  let pos = 8, ihdr = null, plte = null, trns = null;
  const idat = [], text = {};
  while (pos < buf.length) {
    if (pos + 12 > buf.length) throw new PNGError('truncated chunk at byte ' + pos);
    const len = buf.readUInt32BE(pos), type = buf.toString('latin1', pos + 4, pos + 8);
    if (pos + 12 + len > buf.length) throw new PNGError('truncated ' + type + ' chunk');
    const data = buf.subarray(pos + 8, pos + 8 + len);
    const crc = buf.readUInt32BE(pos + 8 + len);
    if (crc32(buf, pos + 4, pos + 8 + len) !== crc) throw new PNGError('CRC mismatch in ' + type + ' chunk');
    if (type === 'IHDR') {
      ihdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), bitDepth: data[8], colorType: data[9], compression: data[10], filter: data[11], interlace: data[12] };
    } else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'tEXt') { const z = data.indexOf(0); if (z > 0) text[data.toString('latin1', 0, z)] = data.toString('latin1', z + 1); }
    else if (type === 'iTXt') {
      const z = data.indexOf(0);
      if (z > 0 && data[z + 1] === 0) { const l = data.indexOf(0, z + 3), t = data.indexOf(0, l + 1); if (l > 0 && t > 0) text[data.toString('latin1', 0, z)] = data.toString('utf8', t + 1); }
    } else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (!ihdr) throw new PNGError('no IHDR chunk');
  const { w, h, bitDepth, colorType, interlace } = ihdr;
  if (!CHANNELS[colorType]) throw new PNGError('unknown colour type ' + colorType);
  if (DEPTHS[colorType].indexOf(bitDepth) < 0) throw new PNGError('bit depth ' + bitDepth + ' is not legal for colour type ' + colorType);
  if (ihdr.compression !== 0 || ihdr.filter !== 0) throw new PNGError('unknown compression or filter method');
  if (interlace) throw new PNGError('interlaced (Adam7) PNG is not supported: re-save the file without interlacing');
  if (colorType === 3 && !plte) throw new PNGError('palette image without a PLTE chunk');
  if (!w || !h) throw new PNGError('empty image');
  let raw;
  try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch (e) { throw new PNGError('corrupt image data: ' + e.message); }
  const bpp = CHANNELS[colorType] * bitDepth; // bits per pixel
  const stride = Math.ceil((w * bpp) / 8), Bpp = Math.max(1, bpp >> 3);
  if (raw.length < h * (stride + 1)) throw new PNGError('image data too short');
  const px = new Uint8Array(h * stride);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = px.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= Bpp ? cur[i - Bpp] : 0, b = prev[i], c = i >= Bpp ? prev[i - Bpp] : 0;
      let v = src[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      else if (f !== 0) throw new PNGError('unknown row filter ' + f + ' on row ' + y);
      cur[i] = v & 255;
    }
    prev = cur;
  }
  // samples → RGBA8
  const out = new Uint8Array(w * h * 4);
  const sample = (row, i) => { // the i-th sample of a row, at its bit depth (16-bit: the full value)
    if (bitDepth === 8) return row[i];
    if (bitDepth === 16) return (row[2 * i] << 8) | row[2 * i + 1];
    const per = 8 / bitDepth, byte = row[Math.floor(i / per)], shift = 8 - bitDepth * ((i % per) + 1);
    return (byte >> shift) & ((1 << bitDepth) - 1);
  };
  const to8 = (v) => (bitDepth === 16 ? v >> 8 : bitDepth === 8 ? v : Math.round((v * 255) / ((1 << bitDepth) - 1)));
  const tv = (i) => (trns && trns.length >= 2 * (i + 1) ? trns.readUInt16BE(2 * i) : -1);
  for (let y = 0; y < h; y++) {
    const row = px.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      let r, g, b, a = 255;
      if (colorType === 0) { const v = sample(row, x); r = g = b = to8(v); if (v === tv(0)) a = 0; }
      else if (colorType === 2) { const R = sample(row, 3 * x), G = sample(row, 3 * x + 1), B = sample(row, 3 * x + 2); r = to8(R); g = to8(G); b = to8(B); if (R === tv(0) && G === tv(1) && B === tv(2)) a = 0; }
      else if (colorType === 3) { const i = sample(row, x); if (3 * i + 2 >= plte.length) throw new PNGError('palette index ' + i + ' out of range'); r = plte[3 * i]; g = plte[3 * i + 1]; b = plte[3 * i + 2]; if (trns && i < trns.length) a = trns[i]; }
      else if (colorType === 4) { r = g = b = to8(sample(row, 2 * x)); a = to8(sample(row, 2 * x + 1)); }
      else { r = to8(sample(row, 4 * x)); g = to8(sample(row, 4 * x + 1)); b = to8(sample(row, 4 * x + 2)); a = to8(sample(row, 4 * x + 3)); }
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a;
    }
  }
  return { w, h, data: out, info: { colorType, bitDepth, interlace, text } };
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0); head.write(type, 4, 'latin1');
  const crcBuf = Buffer.concat([head.subarray(4), data]);
  const tail = Buffer.alloc(4); tail.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([head, data, tail]);
}

export function encodePNG(img, opt = {}) {
  const { w, h, data } = img;
  const colorType = opt.colorType == null ? 6 : opt.colorType;
  let bitDepth = opt.bitDepth || 8;
  if (DEPTHS[colorType] == null || DEPTHS[colorType].indexOf(bitDepth) < 0 || bitDepth === 16) throw new PNGError('cannot encode colour type ' + colorType + ' at ' + bitDepth + ' bits');
  let palette = null;
  if (colorType === 3) {
    if (opt.palette) palette = opt.palette.map((c) => c.slice());
    else {
      const seen = new Map(); palette = [];
      for (let i = 0; i < w * h; i++) { const k = ((data[4 * i] << 24) | (data[4 * i + 1] << 16) | (data[4 * i + 2] << 8) | data[4 * i + 3]) >>> 0; if (!seen.has(k)) { seen.set(k, palette.length); palette.push([data[4 * i], data[4 * i + 1], data[4 * i + 2], data[4 * i + 3]]); } }
    }
    if (palette.length > 1 << bitDepth) throw new PNGError(palette.length + ' colours do not fit a ' + bitDepth + '-bit palette');
  }
  const ch = CHANNELS[colorType], bpp = ch * bitDepth, stride = Math.ceil((w * bpp) / 8), Bpp = Math.max(1, bpp >> 3);
  const index = palette ? new Map(palette.map((c, i) => [((c[0] << 24) | (c[1] << 16) | (c[2] << 8) | c[3]) >>> 0, i])) : null;
  const rows = [];
  for (let y = 0; y < h; y++) {
    const r = new Uint8Array(stride);
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (colorType === 6) r.set(data.subarray(o, o + 4), 4 * x);
      else if (colorType === 2) r.set(data.subarray(o, o + 3), 3 * x);
      else if (colorType === 4) { r[2 * x] = data[o]; r[2 * x + 1] = data[o + 3]; }
      else {
        const v = colorType === 0 ? (bitDepth === 8 ? data[o] : Math.round((data[o] * ((1 << bitDepth) - 1)) / 255)) : index.get(((data[o] << 24) | (data[o + 1] << 16) | (data[o + 2] << 8) | data[o + 3]) >>> 0);
        if (v == null) throw new PNGError('a pixel is not in the palette');
        if (bitDepth === 8) r[x] = v;
        else { const per = 8 / bitDepth; r[Math.floor(x / per)] |= v << (8 - bitDepth * ((x % per) + 1)); }
      }
    }
    rows.push(r);
  }
  const filtered = Buffer.alloc(h * (stride + 1));
  let prev = new Uint8Array(stride);
  const tmp = [0, 1, 2, 3, 4].map(() => new Uint8Array(stride));
  for (let y = 0; y < h; y++) {
    const cur = rows[y];
    const cand = opt.filter != null ? [opt.filter] : [0, 1, 2, 3, 4];
    let best = cand[0], bestSum = Infinity;
    for (const f of cand) {
      const t = tmp[f];
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= Bpp ? cur[i - Bpp] : 0, b = prev[i], c = i >= Bpp ? prev[i - Bpp] : 0;
        let p = 0;
        if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1;
        else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
        const v = (cur[i] - p) & 255;
        t[i] = v; sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { bestSum = sum; best = f; }
    }
    filtered[y * (stride + 1)] = best;
    filtered.set(tmp[best], y * (stride + 1) + 1);
    prev = cur;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = bitDepth; ihdr[9] = colorType; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const parts = [SIG, chunk('IHDR', ihdr)];
  if (palette) {
    parts.push(chunk('PLTE', Buffer.from(palette.flatMap((c) => [c[0], c[1], c[2]]))));
    if (palette.some((c) => c[3] !== 255)) parts.push(chunk('tRNS', Buffer.from(palette.map((c) => c[3]))));
  }
  for (const [k, v] of Object.entries(opt.text || {})) parts.push(chunk('iTXt', Buffer.concat([Buffer.from(k, 'latin1'), Buffer.from([0, 0, 0, 0, 0]), Buffer.from(String(v), 'utf8')])));
  parts.push(chunk('IDAT', zlib.deflateSync(filtered, { level: 9 })));
  parts.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}

// convenience: a blank RGBA image
export const blank = (w, h) => ({ w, h, data: new Uint8Array(w * h * 4) });
