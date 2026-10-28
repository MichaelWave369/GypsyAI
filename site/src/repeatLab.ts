/**
 * v0.2.3: bounded, user-authorized Ollama local repeat laboratory.
 * NOT a cold-start forcing tool; no /api/stop, keep_alive=0 or Ollama reconfiguration.
 * Raw measurements are self-reported and all results are in-memory unless exported.
 */
import { localOllamaUrl } from './logic';
import { runSingleSample } from './localLab';
import type { LocalBenchmarkReceipt } from './localLab';

export type ExperimentKind = 'post_warmup' | 'paired_exploratory';
export type Phase = 'warmup' | 'measurement';
export type ExperimentStatus = 'completed' | 'stopped' | 'failed';
export interface ExperimentConfig {
  kind: ExperimentKind;
  modelA: string;
  modelB?: string;
  repetitions: 3 | 5;
  pairs: 2 | 4;
  modelDigests?: Record<string, string | null>;
  ollamaVersion?: string | null;
}
export interface ExperimentObservation {
  index: number;
  phase: Phase;
  model: string;
  orderLabel: string;
  receipt: LocalBenchmarkReceipt;
}
export interface ExperimentLedger {
  schema: 'GYPSYAI_LOCAL_OLLAMA_REPEAT_V2';
  origin: 'loopback';
  source: 'browser_initiated_ollama_self_report';
  startedAt: string;
  finishedAt: string;
  status: ExperimentStatus;
  error: string | null;
  protocol: {
    promptLabel: 'fixed-public-sample-v1';
    outputLimit: 32;
    temperature: 0;
    noForceCold: true;
    classification: 'post_warmup_or_exploratory';
  };
  config: ExperimentConfig;
  observations: ExperimentObservation[];
  caution: string[];
}
export interface SeriesStats {
  count: number;
  min: number;
  median: number;
  max: number;
  iqr: number;
  range: number;
}
export type MetricKey = 'clientElapsedMs' | 'serverTotalMs' | 'modelLoadMs' |
  'promptEvalMs' | 'generationMs' | 'reportedTokensPerSecond';
export interface ExperimentSummary {
  model: string;
  total: number;
  measured: number;
  outputTokens: number[];
  metrics: Record<MetricKey, SeriesStats | null>;
}
const METRICS: MetricKey[] = [
  'clientElapsedMs', 'serverTotalMs', 'modelLoadMs',
  'promptEvalMs', 'generationMs', 'reportedTokensPerSecond'
];
const CAUTIONS = [
  'Ollama timing and model identity are self-reported, not cryptographically authenticated.',
  'Post-warmup does not guarantee weights remain resident; compare load_duration in each row.',
  'One fixed short prompt and two to five repetitions are exploratory, not a certified benchmark.',
  'A/B order is balanced, but model eviction, background work, quantization and output length can confound comparisons.',
  'No inference path executes on PhiStream; no speedup over PhiStream is claimed.'
];
function isName(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 160;
}
function validNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0;
}
export function validateExperimentConfig(config: ExperimentConfig, installed: string[]) {
  if (!Array.isArray(installed) || !isName(config.modelA) || !installed.includes(config.modelA)) {
    throw new Error('Model A must be a currently discovered local model.');
  }
  if (config.kind === 'post_warmup' && ![3, 5].includes(config.repetitions)) {
    throw new Error('Use 3 or 5 bounded post-warmup measurements.');
  }
  if (config.kind === 'paired_exploratory') {
    if (!isName(config.modelB) || config.modelB === config.modelA || !installed.includes(config.modelB)) {
      throw new Error('Model B must be a different installed local model.');
    }
    if (![2, 4].includes(config.pairs)) throw new Error('Select two or four balanced paired observations.');
  }
  if (!['post_warmup', 'paired_exploratory'].includes(config.kind)) throw new Error('Invalid experiment kind.');
}
export interface PlannedRequest { phase: Phase; model: string; label: string }
export function makeExperimentSchedule(config: ExperimentConfig): PlannedRequest[] {
  const a = config.modelA;
  if (config.kind === 'post_warmup') {
    if (![3, 5].includes(config.repetitions)) throw new Error('Invalid repetition count.');
    return [
      { phase: 'warmup', model: a, label: 'Initial priming request (not measured)' },
      ...Array.from({ length: config.repetitions }, (_, n) => ({
        phase: 'measurement' as const, model: a, label: 'Post-warmup ' + (n + 1)
      }))
    ];
  }
  if (config.kind !== 'paired_exploratory' || !isName(config.modelB) ||
      config.modelB === a || ![2, 4].includes(config.pairs)) {
    throw new Error('Invalid paired experimental design.');
  }
  const b = config.modelB;
  const sequence = config.pairs === 2 ? ['AB', 'BA'] : ['AB', 'BA', 'BA', 'AB'];
  const requests: PlannedRequest[] = [
    { phase: 'warmup', model: a, label: 'Model A priming request' },
    { phase: 'warmup', model: b, label: 'Model B priming request' }
  ];
  sequence.forEach((pair, index) => {
    for (const letter of pair) {
      requests.push({
        phase: 'measurement', model: letter === 'A' ? a : b,
        label: 'Paired round ' + (index + 1) + ' · ' + letter
      });
    }
  });
  return requests;
}
export interface ExperimentCallbacks {
  onProgress?: (observations: ExperimentObservation[], done: number, total: number) => void;
  shouldStop?: () => boolean;
  execute?: (origin: string, model: string) => Promise<LocalBenchmarkReceipt>;
}
export async function runExperiment(
  rawOrigin: string, config: ExperimentConfig, installed: string[], callbacks: ExperimentCallbacks = {}
): Promise<ExperimentLedger> {
  const origin = localOllamaUrl(rawOrigin); // Refuse remote endpoints before any execution.
  validateExperimentConfig(config, installed);
  const schedule = makeExperimentSchedule(config);
  const startedAt = new Date().toISOString();
  const observations: ExperimentObservation[] = [];
  let status: ExperimentStatus = 'completed';
  let error: string | null = null;
  // Copy only a bounded model inventory fingerprint, never user text or chat data.
  const frozenConfig: ExperimentConfig = {
    kind: config.kind, modelA: config.modelA, modelB: config.kind === 'paired_exploratory' ? config.modelB : undefined,
    repetitions: config.repetitions, pairs: config.pairs,
    modelDigests: Object.fromEntries([config.modelA, config.modelB].filter(isName).map((name) =>
      [name, typeof config.modelDigests?.[name] === 'string' ? config.modelDigests[name]!.slice(0, 128) : null])),
    ollamaVersion: typeof config.ollamaVersion === 'string' ? config.ollamaVersion.slice(0, 80) : null
  };
  const execute = callbacks.execute ?? runSingleSample;
  for (const item of schedule) {
    if (callbacks.shouldStop?.()) { status = 'stopped'; break; }
    try {
      const receipt = await execute(origin, item.model);
      if (receipt.schema !== 'GYPSYAI_LOCAL_OLLAMA_SAMPLE_V1' ||
          receipt.model !== item.model || receipt.origin !== 'loopback' ||
          receipt.promptLabel !== 'fixed-public-sample-v1') {
        throw new Error('Local executor returned a mismatched receipt.');
      }
      observations.push({
        index: observations.length + 1, phase: item.phase,
        model: item.model, orderLabel: item.label, receipt
      });
      callbacks.onProgress?.([...observations], observations.length, schedule.length);
    } catch (cause) {
      status = 'failed';
      error = cause instanceof Error ? cause.message.slice(0, 240) : 'Local execution failed.';
      break; // No hidden retry or silent fallback.
    }
  }
  return {
    schema: 'GYPSYAI_LOCAL_OLLAMA_REPEAT_V2', origin: 'loopback',
    source: 'browser_initiated_ollama_self_report',
    startedAt, finishedAt: new Date().toISOString(), status, error,
    protocol: {
      promptLabel: 'fixed-public-sample-v1', outputLimit: 32,
      temperature: 0, noForceCold: true,
      classification: 'post_warmup_or_exploratory'
    },
    config: frozenConfig, observations, caution: [...CAUTIONS]
  };
}
export function median(values: number[]): number | null {
  if (!values.length) return null;
  const rows = [...values].sort((a, b) => a - b);
  const mid = Math.floor(rows.length / 2);
  return rows.length % 2 ? rows[mid] : (rows[mid - 1] + rows[mid]) / 2;
}
export function seriesStats(values: number[]): SeriesStats | null {
  if (!values.length || values.some((n) => !validNum(n))) return null;
  const rows = [...values].sort((a, b) => a - b);
  const middle = Math.floor(rows.length / 2);
  const lower = rows.slice(0, middle);
  const upper = rows.slice(rows.length % 2 ? middle + 1 : middle);
  const q1 = median(lower) ?? rows[0];
  const q3 = median(upper) ?? rows[rows.length - 1];
  return {
    count: rows.length, min: rows[0], max: rows[rows.length - 1],
    median: Number(median(rows)!.toFixed(2)),
    iqr: Number((q3 - q1).toFixed(2)),
    range: Number((rows[rows.length - 1] - rows[0]).toFixed(2))
  };
}
export function summarizeExperiment(ledger: ExperimentLedger): ExperimentSummary[] {
  const models = [ledger.config.modelA, ledger.config.modelB].filter(isName);
  return models.map((model) => {
    const included = ledger.observations.filter((row) => row.model === model && row.phase === 'measurement');
    return {
      model, measured: included.length,
      total: ledger.observations.filter((row) => row.model === model).length,
      outputTokens: included.map((row) => row.receipt.generatedTokens).filter((n): n is number => n !== null),
      metrics: Object.fromEntries(METRICS.map((metric) => [metric, seriesStats(included.map((x) => x.receipt[metric])
        .filter((n): n is number => n !== null))])) as Record<MetricKey, SeriesStats | null>
    };
  });
}
/** Import ONLY previously exported V1 sample numbers, never arbitrary report code or network URLs. */
export function parseLegacySampleJson(rawText: string): LocalBenchmarkReceipt {
  if (rawText.length > 16384) throw new Error('Sample receipt is too large.');
  let value: unknown;
  try { value = JSON.parse(rawText); } catch { throw new Error('Invalid sample JSON.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid receipt structure.');
  const x = value as Record<string, unknown>;
  if (x.schema !== 'GYPSYAI_LOCAL_OLLAMA_SAMPLE_V1' || x.origin !== 'loopback' ||
      x.promptLabel !== 'fixed-public-sample-v1' || x.interpretation !== 'single_observation_not_benchmark' ||
      !isName(x.model) || typeof x.timestamp !== 'string' ||
      Number.isNaN(Date.parse(x.timestamp))) throw new Error('Not a supported GypsyAI V1 local sample receipt.');
  const numbers = ['clientElapsedMs', 'serverTotalMs', 'modelLoadMs', 'promptTokens', 'generatedTokens',
    'promptEvalMs', 'generationMs', 'reportedTokensPerSecond'];
  if (numbers.some((key) => x[key] !== null && !validNum(x[key]))) throw new Error('Invalid numeric sample field.');
  if (!validNum(x.clientElapsedMs) ||
      (x.generatedTokens !== null && (x.generatedTokens as number) > 32) ||
      (x.promptTokens !== null && (x.promptTokens as number) > 10000) ||
      numbers.some((key) => typeof x[key] === 'number' && x[key] > 1e9)) {
    throw new Error('Sample measurements are out of bounds.');
  }
  if (x.doneReason !== null && x.doneReason !== undefined && typeof x.doneReason !== 'string') {
    throw new Error('Invalid completion reason.');
  }
  // Return strictly whitelisted fields so unknown payloads are never retained or exported.
  return {
    schema: 'GYPSYAI_LOCAL_OLLAMA_SAMPLE_V1', timestamp: x.timestamp,
    model: x.model, origin: 'loopback', promptLabel: 'fixed-public-sample-v1',
    clientElapsedMs: x.clientElapsedMs as number,
    serverTotalMs: x.serverTotalMs as number | null,
    modelLoadMs: x.modelLoadMs as number | null,
    promptTokens: x.promptTokens as number | null,
    generatedTokens: x.generatedTokens as number | null,
    promptEvalMs: x.promptEvalMs as number | null,
    generationMs: x.generationMs as number | null,
    reportedTokensPerSecond: x.reportedTokensPerSecond as number | null,
    doneReason: typeof x.doneReason === 'string' ? x.doneReason.slice(0, 80) : null,
    interpretation: 'single_observation_not_benchmark'
  };
}
