# VA-1 usage ledgers

One append-only JSON-lines file per authorization (`<authorization id>.jsonl`), written by
`tools/voice/audition.mjs` through `tools/voice/ledger.mjs`. Every HTTP attempt to a paid provider is written before
it is sent (`type: "attempt"`, with its cost bound) and again when it ends (`type: "outcome"`: HTTP status or
transport error, whether it may have been billed and why, the usage the provider reported, and what was counted).

- Nothing is rewritten or removed. A rerun adds attempts; it never replaces earlier usage. An attempt without an
  outcome counts at its bound.
- The ledger belongs to the authorization, not to an output folder or corpus revision, so its allowance holds
  wherever the runner writes.
- Ledgers hold no credential, no audio and no line of the script: take ids, counts, statuses and amounts only.
  They are committed after each authorised run so the allowance survives this environment.

`node tools/voice/audition.mjs usage --authorization docs/future/voice/authorizations/<id>.json` prints what has been
counted against an allowance.
