# GypsyAI v0.2.4 | Longer-Workload & Multi-Session Laboratory

## Experimental questions

Does a local Ollama model produce stable per-token generation timing across longer output ceilings (128 and 256 tokens), and what does its own loaded-model API report about residency before and after each request? Can two separate local sessions be examined without pooling dissimilar conditions?

## What it actually does

- The operator selects an **already discovered** local model, a bound of 2 or 3 measured samples per output length, and explicitly authorizes 6 or 8 sequential local inference calls.
- Two workload ceilings: 128 and 256 maximum output tokens. The prompt is a single fixed, neutral, nonpersonal request for 300 numbered measurement-related sentences. The exact same prompt and temperature 0 are used at both caps. Every request uses Ollama `/api/generate`, `stream:false`, `num_predict:<cap>` and a 120-second browser timeout.
- For each cap, the first request is labeled priming and excluded from the measured summaries. This is **not** a forced cold start: no keep_alive changes, model stop, cache clearing, process restart or CUDA allocation control.
- Immediately before and after EACH request, the browser performs a read-only `/api/ps` snapshot. Snapshot fields include loaded/not listed, Ollama-reported model size, `size_vram`, context length, and if unavailable the observed error. A snapshot is neither free VRAM nor proof of CUDA compute or no GPU contention.
- Raw observations include actual `eval_count`, `done_reason`, separate prompt-generation-load-total timing, browser wall timing, and reported generation tokens/sec. Early stopping is displayed, never silently counted as hitting 128/256. Missing metrics are represented as unavailable.
- The user can stop after the active request. Partial runs keep the exact partial data with a stopped/failed label. No auto retries or fabricated missing samples.

## Downloadable V3 session ledger

`GYPSYAI_LOCAL_LONG_WORKLOAD_V3` stores the complete experiment sequence, actual output count, bound, latency, model identifier, Ollama-reported digest and version, initial/final loaded-model snapshots, and explicit caveats. It never includes chat, ancestry, user prompts or generated text. Download is user-initiated. The browser does not automatically persist or upload ledger contents.

Import V3 ledgers later from this machine to compare **individual sessions**. Import is capped at 150 KB/file, no more than six files per picker selection and eight in-memory historical sessions. The JSON schema is validated and non-allowlisted fields are discarded. It never executes content, opens a model provider or sends a request on import. It only displays a like-for-like compatibility status when **all** sessions are complete and have the same reported model, digest, Ollama version and full target output token counts. Even matching sessions do NOT establish statistical significance or speedup.

## Source experimental evidence that motivated this PR

The operator previously supplied a real completed GypsyAI V2 Granite 4.2 8B ledger with one priming request and three post-warmup 32-token measurements. The post-warmup measurements were 108.03, 108.04 and 108.25 generated tokens/sec (median 108.04); browser elapsed 324, 318 and 318 ms. These are local self-reported data and do not prove performance at 128/256 tokens. No original source measurement or user-specific device data is copied into this public repo.

## Safety, explicit approval and provider boundary

- HTTPS Pages-to-local Ollama must already pass browser origin/CORS and local network permissions. Origin validation rejects nonloopback servers and strips no paths from rejected URLs.
- No PhiStream inference, chat provider promotion, weight download, browser proxy, or Vercel backend is introduced.
- The app never runs samples at page load, selection, import or reload; it requires explicit approval for the total 6/8 requests each time. The resulting traffic can consume substantial RAM, VRAM and power.
- Ollama model digests are **self-reported**, not independently authenticated. Model residency state is a read-only snapshot, not a CUDA trace.
- Changes in token count, model versions, quantization, cache/thermal conditions, background tasks, or residency may undermine comparability. The UI shows the original observation order, not an implied speedup.

## Manual smoke check after CI and merge

1. Open https://michaelwave369.github.io/GypsyAI/#lab on the Ollama machine.
2. Diagnose local Ollama; ensure version/digest and installed models are populated.
3. Scroll to **06 / Longer workload & session studio**. Choose granite4.2:8b and 2 repeats. Read the resource warning and approve 6 sequential inference calls with up to 12 read-only snapshots.
4. Export the V3 JSON and verify each row reports actual output tokens, `done_reason`, before/after residency, and timing with no response text.
5. Return on another occasion or after a device restart, repeat, export a second V3 session, and import the earlier file. Check the compatibility indicator before interpreting a comparison.
6. Verify no inference is triggered on page refresh or import and that the existing TIEKAT controls and PhiStream research-only panel are untouched.

## CI

`pnpm lint`, `pnpm test`, `pnpm build`, `pnpm pages:build`. Unit tests mock the loopback API and assert exact fixed prompt, 128/256 caps, stop/failure semantics, residency readouts, strict V3 import rules, and cross-session compatibility gates. CI validates code and bundling, **not** your local browser or RTX 5070 performance.
