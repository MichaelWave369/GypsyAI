# GypsyAI v0.2.6 | PocketBrain Tiny Comparison Studio

## Purpose

Evaluate baseline greedy versus repetition-guarded greedy decoding on the already user-loaded, experimental PocketBrain Tiny SmolLM2-135M browser runtime. This does **not** promote PocketBrain to the TIEKAT Oracle provider, does not enable BrainC memory/tools, and does not activate PhiStream inference.

## Operator workflow

1. Open `https://michaelwave369.github.io/GypsyAI/#brains` after merging PR and successful Pages deployment.
2. Approve the external runtime/model download and click **Load PocketBrain Tiny**. SDK JS is a vendored source snapshot, but runtime/model assets remain external and checkpoint revisions are unpinned. Confirm browser capability.
3. Scroll to **04 / PocketBrain comparison studio**. The prompt is a fixed public sample: `Explain in two simple sentences why repeatable scientific observations matter.` It does not access the separate prompt input, Oracle history, TIEKAT memory, or GEDCOM.
4. Select two rounds (default) or four rounds. Confirm a total of 6 or 10 sequential requests: two priming calls then balanced AB/BA (or AB/BA/BA/AB) measured order.
5. Approve the full number of local calls using the checkbox; click **Run approved AB/BA comparison**. The cap is 64 generated tokens per request and the runtime is the same loaded model throughout. The operator may stop **after** the current in-flight generation; there is no cancellation mechanism in the experimental SDK.
6. Inspect each generated answer on screen and optionally assign subjective 0–3 coherence/repetition ratings. Ratings and actual answer text are ephemeral in this tab and are **not** included in the measurement JSON.
7. Compare baseline and guarded descriptive medians/min/max for wall time, first JS callback, first visible text, callback-event count and output character count. **Different output lengths or callback counts are not equal-work decoding benchmarks.**
8. Explicitly download `gypsyai-pocketbrain-paired-ledger-v1.json`. This exports ONLY source/protocol identifiers, per-request numerical evidence and warnings. No user prompt, model response text, ratings, history, family or chat data is included.

## Measurement limits

- Receipts originate from real calls to the loaded browser model, but are self-reported and **not** independently GPU-profiled or checked against a reference implementation.
- PocketBrain Tiny's JS token callback events are NOT independently verified token counts. Callback events per full generation wall are not a pure decode tokens/sec metric.
- The first request in each mode is marked *priming* and excluded from the summary. This is not a controlled cold-start design: both modes share one loaded model and may share GPU compilation/caches, with ordering effects.
- The fixed text and 64-token bound help control the workload but do not guarantee equal generated length, semantically equivalent answers, stable cache state, or comparable per-token workloads.
- Sample size N=2 or N=4 per mode is exploratory. Descriptive statistics here do not establish significance, causal speedup, usefulness or quality superiority.
- The schema `GYPSYAI_POCKETBRAIN_PAIR_V1` includes a completed/stopped/failed status, all completed request receipts and ordering information. It does **not** keep the answer text.
- If an SDK call errors, fail closed with a partial ledger and no silent retry or fallback. A Stop request is honored between model calls, not during an in-flight generation.
- Each tab stores answers and human quality ratings only in React state. Navigating away clears them; the model is released after an in-flight comparison resolves when the page unmounts.

## Security and provider boundaries

- Initial model load remains explicitly user-approved. No external download, Tiny SDK import, inference, or BrainC request occurs merely because this panel renders.
- No changes to BrainC's localhost-only production CORS policy, no tokens, no tool execution, and no memory retrieval.
- The original Ollama/Granite path and consent-controlled TIEKAT Oracle remain unchanged.
- The source SDK copy is identified by Git blob SHAs but does not cryptographically pin the ONNX weights, tokenizer, or downloaded Transformer.js package. Follow the v0.2.5 supply-chain gates before production promotion.

## Automated validation

`pnpm lint`, `pnpm test`, `pnpm build`, `pnpm pages:build`. Tests use an injected SDK-compatible mock to check AB/BA order, bounded requests, no auto-loading, privacy-safe ledgers, status and stop paths. Mock tests do not validate the pretrained weights or actual GPU output.

## Suggested on-device acceptance

Run the two-round cohort in a previously loaded Tiny model with WebGPU and export the JSON. Ensure both modes produce actual text and explain any differing output lengths before comparing times. Test Stop after current request and verify no new call starts. Verify that the JSON lacks the visible outputs. Repeat on WASM in a separate cohort if device resources permit, but do not pool unlike backends.

**Ledger Above Ego.**
