/**
 * Sovereign Brain Bridge v0.2.5
 * Explicit in-browser PocketBrain Tiny research and fixed-loopback BrainC liveness.
 * No keys, TIEKAT/ancestry payloads, automatic downloads or tool execution.
 */
export const POCKETBRAIN_SOURCE = {
  sourceRepo: 'MichaelWave369/PocketBrain',
  sdkVersion: '0.1.0-experimental',
  modelId: 'onnx-community/SmolLM2-135M-Instruct-ONNX-GQA',
  runtimeOrigin: 'https://cdn.jsdelivr.net',
  modelOrigin: 'https://huggingface.co',
  artifactRevision: 'UNPINNED',
  parity: 'NOT_TESTED',
  sourceBlobShas: {
    sdk: '8d8b95ee5e358c4bc390fe807253ac21eac13fac',
    runner: '372958470658f130c24cac16eec14825ea9ffd9a',
    metrics: '1a115c55c18c05ae2a2ae6a51928936b5978a263'
  }
} as const;
const VENDORED_SDK_PATH = '/GypsyAI/vendor/pocketbrain/sdk/v0.1/index.mjs';
export const BRAINC_HEALTH_URL = 'http://127.0.0.1:8000/health';

export type TinyDevice = 'auto' | 'webgpu' | 'wasm';
export type TinyMode = 'baseline' | 'guarded';
export interface TinyStatus {
  phase: string;
  version: string;
  ready: boolean;
  model: string | null;
  device: string | null;
  dtype: string | null;
  completedRuns: number;
  error: string | null;
}
export interface TinyClient {
  getStatus(): TinyStatus;
  load(options: {
    preferredDevice: TinyDevice;
    onProgress: (progress: unknown) => void;
  }): Promise<TinyStatus>;
  generate(prompt: string, options: {
    mode: TinyMode;
    maxNewTokens: 32 | 64;
    onText?: (next: string) => void;
  }): Promise<{ text: string; receipt: unknown }>;
  dispose(): Promise<void>;
}
interface TinySdkModule {
  POCKETBRAIN_TINY_SDK_VERSION: string;
  createPocketBrainTinyClient(options: { onStateChange: (status: TinyStatus) => void }): TinyClient;
}
export interface PocketBrainEvidence {
  schema: 'GYPSYAI_POCKETBRAIN_TINY_BRIDGE_V1';
  recordedAt: string;
  origin: 'browser_inference';
  provider: 'pocketbrain_tiny_experimental';
  sdk: string;
  model: string | null;
  device: string | null;
  mode: TinyMode;
  tokenCap: 32 | 64;
  userInitiated: true;
  evidence: 'BROWSER_SELF_REPORTED_UNVERIFIED';
  source: typeof POCKETBRAIN_SOURCE;
  engineReceipt: Record<string, unknown>;
  responseTextIncluded: false;
  userPromptIncluded: false;
}
export interface BrainCHealth {
  schema: 'GYPSYAI_BRAINC_READ_ONLY_V1';
  checkedAt: string;
  endpoint: typeof BRAINC_HEALTH_URL;
  status: 'self_reported_liveness' | 'invalid_response';
  reportedVersion: string | null;
  notAuthenticated: true;
  canReadMemory: false;
  canExecuteTools: false;
  browserCORSRequired: true;
}
function record(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown> : {};
}
function cleanString(value: unknown, max = 200): string | null {
  return typeof value === 'string' && value.length <= max ? value : null;
}
export function validateTinyPrompt(prompt: string, cap: number): void {
  if (!prompt.trim() || prompt.length > 1000) {
    throw new Error('Write a short, non-sensitive prompt (1–1000 characters).');
  }
  if (![32, 64].includes(cap)) throw new Error('Tiny experiment is limited to 32 or 64 generated tokens.');
}
export function normalizeTinyReceipt(
  raw: unknown, state: TinyStatus, mode: TinyMode, cap: 32 | 64
): PocketBrainEvidence {
  const r = record(raw);
  if (r.schema !== 'POCKETBRAIN_TINY_RUN_V2' ||
      r.evidence !== 'BROWSER_SELF_REPORTED_UNVERIFIED' ||
      (r.model !== state.model) ||
      !['webgpu', 'wasm'].includes(String(r.backend)) ||
      r.mode !== mode) throw new Error('PocketBrain Tiny returned an incompatible evidence receipt.');
  const decode = record(r.decode);
  if (decode.max_new_tokens !== cap) throw new Error('Tiny run used an unexpected output limit.');
  const nonnegative = (x: unknown) => typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : null;
  const engineReceipt: Record<string, unknown> = {
    schema: 'POCKETBRAIN_TINY_RUN_V2',
    evidence: 'BROWSER_SELF_REPORTED_UNVERIFIED',
    model: cleanString(r.model), backend: r.backend, dtype: cleanString(r.dtype),
    mode, maxNewTokens: cap,
    generationWallMs: nonnegative(r.generation_wall_ms),
    timeToFirstTokenCallbackMs: nonnegative(r.time_to_first_token_callback_ms),
    timeToFirstVisibleTextMs: nonnegative(r.time_to_first_visible_text_ms),
    observedTokenCallbackEvents: nonnegative(r.observed_token_callback_events),
    callbackEventsPerSecondFullWall: nonnegative(r.callback_events_per_second_full_wall),
    outputCharCount: nonnegative(r.output_char_count),
    cacheStatus: 'NOT_MEASURED',
    independentParity: 'NOT_TESTED',
    note: 'JS callback events are NOT verified model token counts or GPU decode throughput.'
  };
  return {
    schema: 'GYPSYAI_POCKETBRAIN_TINY_BRIDGE_V1',
    recordedAt: new Date().toISOString(), origin: 'browser_inference',
    provider: 'pocketbrain_tiny_experimental',
    sdk: POCKETBRAIN_SOURCE.sdkVersion,
    model: state.model, device: state.device, mode, tokenCap: cap,
    userInitiated: true,
    evidence: 'BROWSER_SELF_REPORTED_UNVERIFIED',
    source: POCKETBRAIN_SOURCE,
    engineReceipt,
    responseTextIncluded: false, userPromptIncluded: false
  };
}
/** Lazy module import after user action. Local-copy source is reviewed, but remote runtime/model assets remain unpinned. */
export async function importPocketBrainSdk(
  loader?: () => Promise<unknown>
): Promise<TinySdkModule> {
  const sdkPath: string = VENDORED_SDK_PATH;
  const imported = record(await (loader
    ? loader()
    : import(/* @vite-ignore */ sdkPath)));
  if (imported.POCKETBRAIN_TINY_SDK_VERSION !== POCKETBRAIN_SOURCE.sdkVersion ||
      typeof imported.createPocketBrainTinyClient !== 'function') {
    throw new Error('Vendored PocketBrain Tiny SDK contract mismatch.');
  }
  return imported as unknown as TinySdkModule;
}
/** BrainC exposes only unauthenticated liveness. No JWT, memory or chat requests. */
export function classifyBrainCHealth(raw: unknown): BrainCHealth {
  const x = record(raw);
  const ok = x.status === 'ok' && typeof x.version === 'string' &&
    x.version.length > 0 && x.version.length < 80;
  return {
    schema: 'GYPSYAI_BRAINC_READ_ONLY_V1',
    checkedAt: new Date().toISOString(),
    endpoint: BRAINC_HEALTH_URL,
    status: ok ? 'self_reported_liveness' : 'invalid_response',
    reportedVersion: ok ? x.version as string : null,
    notAuthenticated: true, canReadMemory: false,
    canExecuteTools: false, browserCORSRequired: true
  };
}
export async function probeBrainCHealth(): Promise<BrainCHealth> {
  const result = await fetch(BRAINC_HEALTH_URL, {
    method: 'GET', cache: 'no-store',
    credentials: 'omit',
    redirect: 'error',
    signal: AbortSignal.timeout(4000)
  });
  if (!result.ok) throw new Error('BrainC local health HTTP ' + result.status);
  return classifyBrainCHealth(await result.json());
}
