// Intensity metrics of a compiled song (RB.audio._.compile(def)), measured
// over its loop (or the whole song when it does not loop). Pure JS: used by
// the unit tests and quoted in docs/AUDIO.md.
//
//   bpm         section tempo, weighted by time
//   density     pitched note onsets per second (a chord on one track = 1)
//   perc        percussion weight per second: Σ velocity × weight of the
//               voice (big drums 1, mid drums ~0.45, small/metal/wood 0.15)
//   dissonance  share of pitch-class pairs sounding together that are a
//               semitone/major seventh or a tritone apart (sampled every
//               quarter beat)
//   layers      mean number of tracks sounding at once (a percussion track
//               counts while its last stroke is less than a beat old)
//   score       one composite: bpm/100 + density/4 + perc/2 + 4·dissonance + layers/4
export const PERC_WEIGHT = {
  o: 1, z: 1, l: 0.7, k: 0.6, t: 0.5,
  e: 0.45, n: 0.45, q: 0.45, m: 0.35, f: 0.25, p: 0.25,
};
export function intensity(song) {
  const t0 = song.loop ? song.loopStart : 0;
  const t1 = song.length;
  const span = t1 - t0;
  const ev = song.events.filter((e) => e.t >= t0 - 1e-9 && e.t < t1 - 1e-9);
  // tempo
  let bw = 0;
  for (const sec of song.sections) {
    const a = Math.max(sec.start, t0), b = Math.min(sec.start + sec.seconds, t1);
    if (b > a) bw += sec.bpm * (b - a);
  }
  const bpm = bw / span;
  // density
  const onsets = new Set();
  for (const e of ev) if (e.m != null) onsets.add(e.tr + '@' + e.t.toFixed(4));
  const density = onsets.size / span;
  // percussion weight
  let pw = 0;
  for (const e of ev) if (e.p) pw += e.v * (PERC_WEIGHT[e.p] || 0.15);
  const perc = pw / span;
  // dissonance and layers on a quarter-beat grid
  const pitched = ev.filter((e) => e.m != null);
  const percEv = ev.filter((e) => e.p);
  let dis = 0, pairsN = 0, layerSum = 0, samples = 0;
  for (const sec of song.sections) {
    const a = Math.max(sec.start, t0), b = Math.min(sec.start + sec.seconds, t1);
    if (b <= a) continue;
    const step = sec.spb / 4;
    for (let x = a + step / 2; x < b; x += step) {
      const pcs = new Set();
      const tracks = new Set();
      for (const e of pitched) {
        if (e.t <= x && x < e.t + e.d) { pcs.add(((e.m % 12) + 12) % 12); tracks.add(e.tr); }
      }
      for (const e of percEv) if (e.t <= x && x < e.t + sec.spb) tracks.add(e.tr);
      const list = [...pcs];
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const ic = Math.min((list[i] - list[j] + 12) % 12, (list[j] - list[i] + 12) % 12);
          pairsN++;
          if (ic === 1 || ic === 6) dis++;
        }
      }
      layerSum += tracks.size;
      samples++;
    }
  }
  const dissonance = pairsN ? dis / pairsN : 0;
  const layers = samples ? layerSum / samples : 0;
  const score = bpm / 100 + density / 4 + perc / 2 + 4 * dissonance + layers / 4;
  return { bpm, density, perc, dissonance, layers, score };
}
export const fmtIntensity = (m) => `bpm ${m.bpm.toFixed(0)}, density ${m.density.toFixed(2)}/s, perc ${m.perc.toFixed(2)}/s, dissonance ${(m.dissonance * 100).toFixed(1)} %, layers ${m.layers.toFixed(2)}, score ${m.score.toFixed(2)}`;
