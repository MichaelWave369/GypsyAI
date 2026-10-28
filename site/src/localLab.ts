/**
 * GypsyAI Local Intelligence Lab v0.2.2
 * Explicit, browser-initiated loopback-only observations.
 * There is no remote benchmark service, auto-upload, or inference routing.
 */
import { localOllamaUrl } from './logic';

export interface DiagnosticStep {
  endpoint: '/api/version' | '/api/tags' | '/api/ps';
  status: 'ok' | 'error';
  message: string;
  elapsedMs: number;
}

export interface InstalledModel {
  name: string;
  bytes: number | null;
  digest: string | null;
  family: string | null;
  parameters: string | null;
  quantization: string | null;
}
export interface ResidentModel {
  name: string;
  bytes: number | null;
  vramBytes: number | null;
  expiresAt: string | null;
  contextLength: number | null;
}
export interface OllamaDiagnosis {
  checkedAt: string;
  origin: string;
  version: string | null;
  steps: DiagnosticStep[];
  installed: InstalledModel[];
  loaded: ResidentModel[];
  ready: boolean;
}
export interface LocalBenchmarkReceipt {
  schema: 'GYPSYAI_LOCAL_OLLAMA_SAMPLE_V1';
  timestamp: string;
  model: string;
  origin: 'loopback';
  promptLabel: 'fixed-public-sample-v1';
  clientElapsedMs: number;
  serverTotalMs: number | null;
  modelLoadMs: number | null;
  promptTokens: number | null;
  generatedTokens: number | null;
  promptEvalMs: number | null;
  generationMs: number | null;
  reportedTokensPerSecond: number | null;
  doneReason: string | null;
  interpretation: 'single_observation_not_benchmark';
}
const SAMPLE_PROMPT = 'Reply with one short sentence describing why repeatable measurements matter.';
const SAMPLE_MAX_TOKENS = 32;
const PHISTREAM_ORIGIN = 'http://127.0.0.1:8765';
const PHISTREAM_SCHEMA = 'phistream-gypsyai-bridge/v1';

function recordString(x: unknown, limit = 160): string | null {
  return typeof x === 'string' && x.length <= limit ? x : null;
}
function finiteUnsigned(x: unknown): number | null {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : null;
}
function validNs(x: unknown): number | null {
  const n = finiteUnsigned(x);
  return n === null ? null : Number((n / 1e6).toFixed(2));
}
function safeObject(x: unknown): Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, unknown> : {};
}
function cleanError(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  if (/failed to fetch|networkerror|load failed|fetch failed/i.test(message)) {
    return 'Connection blocked or unavailable (service stopped, origin/CORS, HTTPS-to-localhost or browser local-network permission).';
  }
  return message.slice(0, 240);
}
async function getLocalJson(origin: string, path: string, timeoutMs = 5500): Promise<unknown> {
  const result = await fetch(origin + path, {
    method: 'GET',
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!result.ok) throw new Error('HTTP ' + result.status + ' from ' + path);
  return result.json();
}
export function asInstalledModel(value: unknown): InstalledModel | null {
  const row = safeObject(value);
  const name = recordString(row.name);
  if (!name) return null;
  const details = safeObject(row.details);
  return {
    name,
    bytes: finiteUnsigned(row.size),
    digest: recordString(row.digest, 128),
    family: recordString(details.family),
    parameters: recordString(details.parameter_size),
    quantization: recordString(details.quantization_level)
  };
}
export function asResidentModel(value: unknown): ResidentModel | null {
  const row = safeObject(value);
  const name = recordString(row.name) || recordString(row.model);
  if (!name) return null;
  return {
    name,
    bytes: finiteUnsigned(row.size),
    vramBytes: finiteUnsigned(row.size_vram),
    expiresAt: recordString(row.expires_at, 128),
    contextLength: finiteUnsigned(row.context_length)
  };
}

export async function diagnoseLocalOllama(raw: string): Promise<OllamaDiagnosis> {
  const origin = localOllamaUrl(raw); // Reject external hosts and paths before ANY request.
  const report: OllamaDiagnosis = {
    checkedAt: new Date().toISOString(), origin,
    version: null, steps: [], installed: [], loaded: [], ready: false
  };
  for (const path of ['/api/version', '/api/tags', '/api/ps'] as const) {
    const started = performance.now();
    try {
      const data = safeObject(await getLocalJson(origin, path));
      if (path === '/api/version') {
        const version = recordString(data.version, 80);
        if (!version) throw new Error('Malformed Ollama version response.');
        report.version = version;
      } else {
        if (!Array.isArray(data.models)) throw new Error('Malformed model list response.');
        if (path === '/api/tags') {
          report.installed = data.models.slice(0, 200).map(asInstalledModel).filter((x): x is InstalledModel => !!x);
        } else {
          report.loaded = data.models.slice(0, 200).map(asResidentModel).filter((x): x is ResidentModel => !!x);
        }
      }
      report.steps.push({ endpoint: path, status: 'ok', message: 'Responded', elapsedMs: Math.round(performance.now() - started) });
    } catch (e) {
      report.steps.push({ endpoint: path, status: 'error', message: cleanError(e), elapsedMs: Math.round(performance.now() - started) });
    }
  }
  report.ready = report.steps.every((x) => x.status === 'ok');
  return report;
}

export function modelUsageReceipt(model: string, rawResponse: unknown, elapsedMs: number): LocalBenchmarkReceipt {
  const raw = safeObject(rawResponse);
  if (raw.done !== true || (recordString(raw.model, 160) && raw.model !== model)) {
    throw new Error('Ollama did not return a completed matching-model response.');
  }
  const count = finiteUnsigned(raw.eval_count);
  const duration = finiteUnsigned(raw.eval_duration);
  return {
    schema: 'GYPSYAI_LOCAL_OLLAMA_SAMPLE_V1',
    timestamp: new Date().toISOString(), model, origin: 'loopback',
    promptLabel: 'fixed-public-sample-v1',
    clientElapsedMs: Math.round(elapsedMs),
    serverTotalMs: validNs(raw.total_duration),
    modelLoadMs: validNs(raw.load_duration),
    promptTokens: finiteUnsigned(raw.prompt_eval_count),
    generatedTokens: count,
    promptEvalMs: validNs(raw.prompt_eval_duration),
    generationMs: validNs(raw.eval_duration),
    reportedTokensPerSecond: count !== null && duration !== null && duration > 0
      ? Number((count * 1e9 / duration).toFixed(2)) : null,
    doneReason: recordString(raw.done_reason, 80),
    interpretation: 'single_observation_not_benchmark'
  };
}

/** One small request only when operator clicks 'Run sample'; never runs on mount or model selection. */
export async function runSingleSample(raw: string, model: string): Promise<LocalBenchmarkReceipt> {
  const origin = localOllamaUrl(raw);
  if (!model.trim() || model.length > 160) throw new Error('Choose a local model first.');
  const started = performance.now();
  const result = await fetch(origin + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, prompt: SAMPLE_PROMPT, stream: false, options: { temperature: 0, num_predict: SAMPLE_MAX_TOKENS }
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!result.ok) throw new Error('Sample request failed with HTTP ' + result.status);
  const parsed: unknown = await result.json();
  return modelUsageReceipt(model, parsed, performance.now() - started);
}

export interface PhiStreamProbe {
  endpoint: typeof PHISTREAM_ORIGIN;
  schema: typeof PHISTREAM_SCHEMA;
  status: 'read_only_research' | 'invalid_response';
  source: 'self_reported_unverified';
  modelExecutionEnabled: false;
  chatProviderEnabled: false;
  reasons: string[];
}
export function classifyPhiStreamHandshake(input: unknown): PhiStreamProbe {
  const body = safeObject(input);
  const matchesSchema = body.schema === PHISTREAM_SCHEMA;
  const readOnly = body.mode === 'read_only' && body.model_execution === false;
  return {
    endpoint: PHISTREAM_ORIGIN, schema: PHISTREAM_SCHEMA,
    status: matchesSchema && readOnly ? 'read_only_research' : 'invalid_response',
    source: 'self_reported_unverified',
    modelExecutionEnabled: false, chatProviderEnabled: false,
    reasons: [
      matchesSchema ? 'Schema declared by local responder; not independently authenticated.' : 'Expected bridge contract not supplied.',
      readOnly ? 'Read-only claimed; no inference request is permitted.' : 'Bridge must declare read_only and model_execution=false.',
      'No verified tokenizer/model parity, weight provenance, memory preflight and chat adapter handshake.',
      'PhiStream is never automatically promoted into the chat provider selector.'
    ]
  };
}
/**
 * An optional FUTURE companion's read-only health contract.
 * Fixed loopback endpoint, GET ONLY, and never /generate or /chat.
 * This repo does not ship a PhiStream network server.
 */
export async function probePhiStreamResearchOnly(): Promise<PhiStreamProbe> {
  const data = await getLocalJson(PHISTREAM_ORIGIN, '/health', 3500);
  return classifyPhiStreamHandshake(data);
}

export const LAB_PHI_GATE_NAMES = [
  'Signed or independently checked checkpoint fingerprint and license',
  'Reference-trace token/logit parity on matching checkpoint',
  'Fresh hardware and memory fit preflight',
  'Tokenizer + versioned chat protocol compatibility',
  'Explicit operator approval before model execution'
] as const;

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return 'Not reported';
  return (bytes / 1024 ** 3).toFixed(2) + ' GiB';
}
