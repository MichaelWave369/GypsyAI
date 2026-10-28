# PocketBrain Tiny snapshot for GypsyAI v0.2.5

This folder is a byte-for-byte UTF-8 source snapshot of selected MIT PocketBrain files.
Source repository: https://github.com/MichaelWave369/PocketBrain

| Local file | Source path | Git blob SHA |
| --- | --- | --- |
| sdk/v0.1/index.mjs | public/sdk/v0.1/index.mjs | 8d8b95ee5e358c4bc390fe807253ac21eac13fac |
| pocketbrain-tiny.mjs | public/pocketbrain-tiny.mjs | 372958470658f130c24cac16eec14825ea9ffd9a |
| pocketbrain-tiny-metrics.mjs | public/pocketbrain-tiny-metrics.mjs | 1a115c55c18c05ae2a2ae6a51928936b5978a263 |

The copied JavaScript has **not** been independently audited and is an **experimental SDK candidate**.
Importing the SDK is lazy and does not initialize the model; clicking Load downloads Transformers.js 3.8.1
from cdn.jsdelivr.net and the ONNX weights/tokenizer for onnx-community/SmolLM2-135M-Instruct-ONNX-GQA
from Hugging Face. These **remote artifacts are not pinned to an immutable revision or content hash**.
Normal network metadata is shared with those providers at download time. No model weights are bundled.
The original model family HuggingFaceTB/SmolLM2-135M-Instruct is distributed under Apache-2.0,
and the ONNX derivative retains separate distribution/license obligations. Verify remote provenance
and model license before any production provider promotion.

Read site/SOVEREIGN_BRAIN_BRIDGE.md for the execution and user-consent boundary.
