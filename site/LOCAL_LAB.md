# GypsyAI v0.2.2 | Local Intelligence Lab

GitHub Pages is static React. No backend, no new provider, no public model service.
Local lab paths in site/src/localLab.ts are an explicitly initiated browser operation.

## Running a local observation

1. Open https://michaelwave369.github.io/GypsyAI/#lab from the SAME computer as Ollama.
2. Click Diagnose local Ollama. This makes GET requests to /api/version, /api/tags and /api/ps, using loopback only.
3. Read installed model metadata and running-model size_vram. Ollama-reported size_vram is model residency, not free GPU memory, measured peak CUDA allocation, or a hardware speed guarantee.
4. To execute ONE local sample, select a detected model, read the resource warning, tick explicit operator approval, and click Run one local sample.
5. This sends a fixed nonpersonal sample prompt to /api/generate with stream=false, temperature=0 and max 32 generated tokens. The response text is discarded; optional downloaded JSON contains only measurement fields and model name.
6. The displayed generation token/s uses reported eval_count divided by reported eval_duration (nanoseconds). Server total and load duration, plus browser elapsed time, are separate metrics. Missing measurements are displayed as n/a.

One sample does NOT establish warmed throughput, speedup, prefill efficacy, a VRAM guarantee, CUDA use, statistical significance, or comparison against PhiStream. The sample may consume memory and power; nothing executes without clicking the button.

## PhiStream research boundary

An optional read-only GET probes fixed http://127.0.0.1:8765/health only. No server currently ships with the GypsyAI or PhiStream repo for this endpoint; failure is expected.

The proposed future response must declare schema=phistream-gypsyai-bridge/v1, mode=read_only, model_execution=false. These are self-reported values and NEVER unlock chat, inference or a model switch, even if additional fields claim it is ready.

Future promotion requires (1) independently checked checkpoint fingerprint/license, (2) checkpoint-bound independent token and logit parity, (3) fresh device/memory preflight, (4) tokenizer and versioned chat protocol adapter, (5) explicit operator approval. All are unverified here.

Do not expose Ollama publicly, open router ports, disable HTTPS protections, bind Ollama to 0.0.0.0, or use wildcard origin allowances. The repo's loopback URL validator rejects remote endpoints. Browser HTTPS to localhost depends on CORS and local network permissions.

## Validation

From the root: pnpm lint; pnpm test; pnpm build; pnpm pages:build.
New unit tests cover loopback rejection, the three diagnostic routes, offline errors, one explicit fixed prompt sample, reported usage arithmetic, and PhiStream non-promotion. Perform an on-device browser smoke test after merge; CI cannot prove your own localhost is accessible.

Recommended smoke check: offline lab errors are visible; local Ollama GETs occur on click; sample runs only after opt-in; result is not saved automatically; PhiStream GET-only probe never calls /generate; existing TIEKAT and privacy controls remain functional.
