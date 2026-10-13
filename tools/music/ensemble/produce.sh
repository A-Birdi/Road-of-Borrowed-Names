#!/usr/bin/env bash
# MT-2: one song through the whole Ensemble production (development tool; nothing here ships):
#   export_events.mjs -> stems.mjs -> render.py -> package.py -> verify.mjs, then its working masters are removed.
#
#   tools/music/ensemble/produce.sh <songId>
#   xargs -P 4 -n 1 tools/music/ensemble/produce.sh < list        (RB_PAGE=<a fixed scratch build> for parallel runs)
#
# Each step's output goes to <work>/<id>/produce.log; one line per song on stdout. Several songs may run at once:
# each step writes only its own song's files, and verify.mjs changes the manifest under a lock.
set -uo pipefail
id="$1"
cd "$(dirname "$0")/../../.."
work="${RBN_MUSIC_WORK:-tmp/music-ensemble}"
mkdir -p "$work/$id"
log="$work/$id/produce.log"
t0=$(date +%s)
if {
  node tools/music/ensemble/export_events.mjs "$id" &&
  node tools/music/ensemble/stems.mjs "$id" &&
  RBN_SR=48000 python3 tools/music/ensemble/render.py "$id" &&
  python3 tools/music/ensemble/package.py "$id" &&
  node tools/music/ensemble/verify.mjs "$id"
} > "$log" 2>&1; then
  st=$(grep -Eo '(READY|pending)' "$log" | tail -1)
  # (the masters are kept unless the song is ready, to look at or verify again; the QA report records what they were)
  [ "$st" = READY ] && rm -f "$work/$id/head.wav" "$work/$id/loop.wav"
  echo "$id $st $(( $(date +%s) - t0 ))s"
else
  echo "$id FAILED $(( $(date +%s) - t0 ))s: $(tail -3 "$log" | tr '\n' ' ' | cut -c1-240)"
fi
