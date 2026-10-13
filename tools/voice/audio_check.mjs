// VA-1: the technical check on one generated take. It measures; it does not listen, and it cannot show that the
// right words were said. Its outcomes: `unusable` (empty, undecodable or silent), `anomaly_flagged` (clipping, long
// edge silence, a duration far from what the words need or from the matched take: each names what to listen for) or
// `no_anomaly_found` (none of those: not a pass, not a transcript check, never pronunciation, accent or acting, §12).
//  - WAV (PCM 16-bit) is measured from its samples; MP3 by walking its frames (duration only).
//  - Expected duration comes from the line's morae (its kana with the corpus's readings for the kanji) at 4–11
//    morae a second, widened for pauses; a much longer take is the sign of an instruction read aloud.

const SMALL = 'ゃゅょぁぃぅぇぉャュョァィゥェォ';
// morae of the spoken line: kanji replaced by their readings (readingTokens), punctuation as pauses
export function moraeOf(c) {
  let t = c.spokenText;
  const toks = (c.readingTokens || []).slice().sort((a, b) => b.surface.length - a.surface.length);
  for (const tok of toks) t = t.split(tok.surface).join(tok.reading);
  const kana = [...t].filter((ch) => /[ぁ-ー]/.test(ch) && !SMALL.includes(ch)).length;
  const unread = [...t].filter((ch) => /[一-鿿]/.test(ch)).length; // a kanji without a recorded reading: ~2 morae
  const pauses = [...t].filter((ch) => '、。…！？!?—―'.includes(ch)).length;
  return { morae: kana + 2 * unread, pauses };
}
export function expectedSeconds(c) {
  const { morae, pauses } = moraeOf(c);
  return { min: Math.max(0.3, morae / 11), max: morae / 4 + pauses * 0.6 + 1.5, morae };
}

export function parseWav(buf) {
  if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') return null;
  let off = 12, fmt = null, data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(body), channels: buf.readUInt16LE(body + 2), sampleRate: buf.readUInt32LE(body + 4), bits: buf.readUInt16LE(body + 14) };
    if (id === 'data') { data = buf.subarray(body, Math.min(buf.length, body + (size === 0xffffffff || size === 0 ? buf.length : size))); break; }
    off = body + size + (size & 1);
  }
  if (!fmt || !data) return null;
  return { ...fmt, data };
}

const MP3_BITRATE = { 1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160] };
const MP3_RATE = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
export function mp3Duration(buf) {
  let i = 0;
  if (buf.toString('ascii', 0, 3) === 'ID3') i = 10 + ((buf[6] & 0x7f) << 21 | (buf[7] & 0x7f) << 14 | (buf[8] & 0x7f) << 7 | (buf[9] & 0x7f));
  let secs = 0, frames = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) { i++; continue; }
    const ver = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3, bri = buf[i + 2] >> 4, sri = (buf[i + 2] >> 2) & 3, pad = (buf[i + 2] >> 1) & 1;
    if (ver === 1 || layer !== 1 || bri === 0 || bri === 15 || sri === 3) { i++; continue; } // Layer III only
    const rate = MP3_RATE[ver][sri], kbps = MP3_BITRATE[ver === 3 ? 1 : 2][bri];
    const spf = ver === 3 ? 1152 : 576;
    const len = Math.floor((spf / 8) * kbps * 1000 / rate) + pad;
    if (len < 4) { i++; continue; }
    secs += spf / rate; frames++; i += len;
  }
  return frames ? { seconds: secs, frames } : null;
}

// the measurements and flags for one take; `pair` is the matching take of the same case (directed ↔ control), if any
export function checkTake(buf, mime, c, pair) {
  const flags = [], fails = [];
  const m = { bytes: buf.length };
  if (!buf.length) fails.push('empty file');
  const wav = /wav/.test(mime) || buf.toString('ascii', 0, 4) === 'RIFF' ? parseWav(buf) : null;
  if (wav) {
    m.sampleRate = wav.sampleRate; m.channels = wav.channels; m.bits = wav.bits;
    if (wav.format !== 1 || wav.bits !== 16) fails.push('not 16-bit PCM WAV (format ' + wav.format + ', ' + wav.bits + ' bits)');
    else {
      const n = Math.floor(wav.data.length / 2 / wav.channels);
      m.seconds = n / wav.sampleRate;
      let peak = 0, sum = 0, clipped = 0, first = -1, last = -1;
      const thr = 0.01 * 32768;
      for (let k = 0; k < n; k++) {
        const v = Math.abs(wav.data.readInt16LE(k * 2 * wav.channels));
        if (v > peak) peak = v;
        sum += v * v;
        if (v >= 32700) clipped++;
        if (v > thr) { if (first < 0) first = k; last = k; }
      }
      m.peakDbfs = peak ? +(20 * Math.log10(peak / 32768)).toFixed(1) : -Infinity;
      m.rmsDbfs = n && sum ? +(10 * Math.log10(sum / n / 32768 / 32768)).toFixed(1) : -Infinity;
      m.clippedFraction = n ? +(clipped / n).toFixed(5) : 0;
      m.leadingSilence = first < 0 ? m.seconds : +(first / wav.sampleRate).toFixed(2);
      m.trailingSilence = last < 0 ? m.seconds : +((n - 1 - last) / wav.sampleRate).toFixed(2);
      if (first < 0) fails.push('silent (nothing above −40 dBFS)');
      if (m.clippedFraction > 0.001) flags.push('clipping (' + (m.clippedFraction * 100).toFixed(2) + '% of samples at full scale)');
      if (m.leadingSilence > 1.5) flags.push('long silence before speech (' + m.leadingSilence + ' s)');
      if (m.trailingSilence > 2) flags.push('long silence after speech (' + m.trailingSilence + ' s)');
    }
  } else if (/mpeg|mp3/.test(mime) || buf[0] === 0xff || buf.toString('ascii', 0, 3) === 'ID3') {
    const d = mp3Duration(buf);
    if (!d) fails.push('no MP3 frames found');
    else { m.seconds = +d.seconds.toFixed(2); m.frames = d.frames; }
  } else if (buf.length) fails.push('unrecognised audio format (' + (mime || 'no type') + ')');
  if (m.seconds != null) {
    const e = expectedSeconds(c);
    m.expectedSeconds = { min: +e.min.toFixed(2), max: +e.max.toFixed(2), morae: e.morae };
    if (m.seconds < e.min) flags.push('shorter than the words need (' + m.seconds.toFixed(2) + ' s for ' + e.morae + ' morae): words may be missing');
    if (m.seconds > e.max) flags.push('longer than the words need (' + m.seconds.toFixed(2) + ' s for ' + e.morae + ' morae): listen for added or spoken direction');
    if (pair && pair.seconds) {
      const r = m.seconds / pair.seconds;
      m.ratioToPair = +r.toFixed(2);
      if (r > 1.8 || r < 0.55) flags.push('duration differs from the matched take by ×' + r.toFixed(2));
    }
  }
  return { status: fails.length ? 'unusable' : flags.length ? 'anomaly_flagged' : 'no_anomaly_found', method: 'measurement only (decode, level, silence, clipping, duration against morae and the matched take): it can flag anomalies, it cannot show the words are right', measurements: m, flags, failures: fails };
}
