/**
 * GypsyAI v0.2.4: longer output workload observations.
 * No forced cold-starts, cloud calls, inference-provider switching, or PhiStream execution.
 * No automatic network activity; every cohort requires one explicit approval.
 */
import { localOllamaUrl } from './logic';
import { seriesStats } from './repeatLab';
import type { SeriesStats } from './repeatLab';

export type LongCap = 128 | 256;
export type LongPhase = 'priming' | 'measured';
export type LongStatus = 'completed' | 'stopped' | 'failed';
export interface ResidentSnapshot {
  checkedAt: string;
  status: 'observed' | 'unavailable';
  loaded: boolean | null;
  sizeBytes: number | null;
  sizeVramBytes: number | null;
  contextLength: number | null;
  error: string | null;
}
export interface LongSample {
  ordinal: number;
  cap: LongCap;
  phase: LongPhase;
  browserElapsedMs: number;
  modelLoadMs: number | null;
  serverTotalMs: number | null;
  promptEvalMs: number | null;
  generationMs: number | null;
  promptTokens: number | null;
  outputTokens: number | null;
  generationTokensPerSecond: number | null;
  doneReason: string | null;
  reachedCap: boolean;
  before: ResidentSnapshot;
  after: ResidentSnapshot;
}
export interface LongConfig {
  model: string;
  digest: string | null;
  ollamaVersion: string | null;
  repetitions: 2 | 3;
}
export interface LongLedger {
  schema: 'GYPSYAI_LOCAL_LONG_WORKLOAD_V3';
  source: 'ollama_self_report_browser_local';
  origin: 'loopback';
  startedAt: string;
  finishedAt: string;
  sessionId: string;
  status: LongStatus;
  error: string | null;
  config: LongConfig;
  protocol: {
    promptLabel: 'fixed-neutral-extended-v1';
    caps: [128, 256];
    temperature: 0;
    forcedCold: false;
    perCallTimeoutMs: 120000;
    responseTextRetained: false;
  };
  observations: LongSample[];
  limitations: string[];
}
export interface LongSummary {
  cap: LongCap;
  count: number;
  tokenCounts: number[];
  hitCapCount: number;
  browser: SeriesStats | null;
  loading: SeriesStats | null;
  prompt: SeriesStats | null;
  generation: SeriesStats | null;
  tokensPerSecond: SeriesStats | null;
}
export interface SessionComparison {
  compatible: boolean;
  reasons: string[];
  sessions: Array<{
    startedAt: string;
    sessionId: string;
    status: LongStatus;
    summaries: LongSummary[];
  }>;
}

export const LONG_LIMITATIONS = [
  'This is a small on-demand model observation, not a certified cold/warm or GPU benchmark.',
  'Each 128/256-token workload has one priming request; priming is excluded from summary statistics.',
  'The prompt is fixed, but output can stop early. Report actual token count and done_reason; different token counts mean unequal work.',
  'Ollama /api/ps reports loaded-model residency, not free VRAM, CUDA usage, or peak process allocation.',
  'Ollama metrics and model digests are self-reported; local receipts are not authenticated.',
  'Background processes, throttling, evictions and caches can affect performance; compare sessions descriptively.',
  'PhiStream is not invoked and is not a live chat/inference provider.'
] as const;

const EXTENDED_PROMPT =
  'For a neutral generation-length measurement, write 300 numbered short sentences about reproducible scientific measurements, data quality, and careful note taking. Continue the numbered list without a conclusion. This is a synthetic workload, not a user request.';

function plain(x: unknown): Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, unknown> : {};
}
function num(x: unknown): number | null {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : null;
}
function stringVal(x: unknown, max = 160): string | null {
  return typeof x === 'string' && x.length <= max ? x : null;
}
function nsToMs(x: unknown): number | null {
  const n = num(x);
  return n === null ? null : Math.round(n / 10000) / 100;
}
function errorText(x: unknown) {
  return (x instanceof Error ? x.message : 'Local request failed.').slice(0, 240);
}
const now = () => new Date().toISOString();

export function planLongCohort(repetitions: 2 | 3): Array<{ cap: LongCap; phase: LongPhase }> {
  if (![2, 3].includes(repetitions)) throw new Error('Only 2 or 3 measured repeats per length are allowed.');
  return ([128, 256] as const).flatMap((cap) => [
    { cap, phase: 'priming' as const },
    ...Array.from({ length: repetitions }, () => ({ cap, phase: 'measured' as const }))
  ]);
}
export function validateLongConfig(config: LongConfig, installed: string[]) {
  if (!config.model || config.model.length > 160 || !installed.includes(config.model)) {
    throw new Error('Select a currently discovered local model.');
  }
  planLongCohort(config.repetitions);
}
/** Read-only, bounded, same loopback origin as the already validated Ollama client. */
export async function readResidency(rawOrigin: string, model: string): Promise<ResidentSnapshot> {
  const origin = localOllamaUrl(rawOrigin);
  const checkedAt = now();
  try {
    const res = await fetch(origin + '/api/ps', {
      method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(4500)
    });
    if (!res.ok) throw new Error('Ollama residency HTTP ' + res.status);
    const data = plain(await res.json());
    if (!Array.isArray(data.models)) throw new Error('Unexpected Ollama residency response.');
    const item = data.models.map(plain).find((m) => m.name === model || m.model === model);
    return {
      checkedAt, status: 'observed', loaded: !!item,
      sizeBytes: item ? num(item.size) : null,
      sizeVramBytes: item ? num(item.size_vram) : null,
      contextLength: item ? num(item.context_length) : null,
      error: null
    };
  } catch (e) {
    return {
      checkedAt, status: 'unavailable', loaded: null,
      sizeBytes: null, sizeVramBytes: null, contextLength: null,
      error: errorText(e)
    };
  }
}
/**
 * The only inference call in this module: fixed, nonpersonal prompt, bounded
 * length, explicit client-side timeout. The model's actual response is dropped.
 */
export async function executeLongSample(
  rawOrigin: string, model: string, cap: LongCap
): Promise<Omit<LongSample, 'ordinal' | 'phase' | 'before' | 'after'>> {
  const origin = localOllamaUrl(rawOrigin);
  if (!model || model.length > 160 || ![128, 256].includes(cap)) throw new Error('Unsupported model/cap.');
  const start = performance.now();
  const res = await fetch(origin + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, prompt: EXTENDED_PROMPT, stream: false,
      options: { temperature: 0, num_predict: cap }
    }),
    signal: AbortSignal.timeout(120000)
  });
  if (!res.ok) throw new Error('Ollama inference HTTP ' + res.status);
  const data = plain(await res.json());
  if (data.done !== true || data.model !== model) {
    throw new Error('Ollama response was incomplete or for the wrong model.');
  }
  const outputTokens = num(data.eval_count);
  const generationNs = num(data.eval_duration);
  if (outputTokens !== null && outputTokens > cap) throw new Error('Ollama exceeded the approved token cap.');
  return {
    cap, browserElapsedMs: Math.round(performance.now() - start),
    modelLoadMs: nsToMs(data.load_duration),
    serverTotalMs: nsToMs(data.total_duration),
    promptEvalMs: nsToMs(data.prompt_eval_duration),
    generationMs: nsToMs(data.eval_duration),
    promptTokens: num(data.prompt_eval_count),
    outputTokens,
    generationTokensPerSecond: outputTokens !== null && generationNs !== null && generationNs > 0
      ? Math.round((outputTokens * 1e11) / generationNs) / 100 : null,
    doneReason: stringVal(data.done_reason, 80),
    reachedCap: outputTokens === cap
  };
}
export interface LongHooks {
  shouldStop?: () => boolean;
  onProgress?: (observations: LongSample[], done: number, total: number) => void;
  execute?: typeof executeLongSample;
  residence?: typeof readResidency;
}
/** Caller must obtain the checkbox approval before invoking this function. */
export async function runLongCohort(
  originRaw: string, config: LongConfig, installed: string[], hooks: LongHooks = {}
): Promise<LongLedger> {
  const origin = localOllamaUrl(originRaw);
  validateLongConfig(config, installed);
  const schedule = planLongCohort(config.repetitions);
  const startedAt = now();
  const observations: LongSample[] = [];
  let status: LongStatus = 'completed';
  let error: string | null = null;
  const execute = hooks.execute ?? executeLongSample;
  const residence = hooks.residence ?? readResidency;
  for (const item of schedule) {
    if (hooks.shouldStop?.()) { status = 'stopped'; break; }
    try {
      const before = await residence(origin, config.model);
      const sample = await execute(origin, config.model, item.cap);
      if (sample.cap !== item.cap || !num(sample.browserElapsedMs) ||
          (sample.outputTokens !== null && (sample.outputTokens < 0 || sample.outputTokens > item.cap))) {
        throw new Error('Sample receipt failed its cap or elapsed-time check.');
      }
      const after = await residence(origin, config.model);
      observations.push({
        ...sample, ordinal: observations.length + 1,
        cap: item.cap, phase: item.phase, before, after
      });
      hooks.onProgress?.([...observations], observations.length, schedule.length);
    } catch (e) {
      status = 'failed'; error = errorText(e); break; // Never retry behind the user's back.
    }
  }
  return {
    schema: 'GYPSYAI_LOCAL_LONG_WORKLOAD_V3',
    source: 'ollama_self_report_browser_local', origin: 'loopback',
    startedAt, finishedAt: now(),
    sessionId: 'gypsyai-session-' + startedAt.replace(/[^0-9]/g, '').slice(0, 17),
    status, error,
    config: {
      model: config.model,
      digest: stringVal(config.digest, 128),
      ollamaVersion: stringVal(config.ollamaVersion, 80),
      repetitions: config.repetitions
    },
    protocol: {
      promptLabel: 'fixed-neutral-extended-v1', caps: [128, 256],
      temperature: 0, forcedCold: false, perCallTimeoutMs: 120000,
      responseTextRetained: false
    },
    observations, limitations: [...LONG_LIMITATIONS]
  };
}
export function summarizeLongLedger(ledger: LongLedger): LongSummary[] {
  return ([128, 256] as const).map((cap) => {
    const rows = ledger.observations.filter((r) => r.cap === cap && r.phase === 'measured');
    function stats(key: 'browserElapsedMs' | 'modelLoadMs' | 'promptEvalMs' |
      'generationMs' | 'generationTokensPerSecond') {
      return seriesStats(rows.map((r) => r[key]).filter((n): n is number => n !== null));
    }
    return {
      cap, count: rows.length,
      tokenCounts: rows.map((r) => r.outputTokens).filter((n): n is number => n !== null),
      hitCapCount: rows.filter((r) => r.reachedCap).length,
      browser: stats('browserElapsedMs'),
      loading: stats('modelLoadMs'),
      prompt: stats('promptEvalMs'),
      generation: stats('generationMs'),
      tokensPerSecond: stats('generationTokensPerSecond')
    };
  });
}
/**
 * Fail-closed import of a local V3 ledger. Reject arbitrary object graphs,
 * excessive size, unexpected endpoints and unbounded observation arrays.
 */
export function parseLongLedger(text: string): LongLedger {
  if (text.length > 150000) throw new Error('The local V3 session file is too large.');
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new Error('Invalid session JSON.'); }
  const r = plain(raw);
  const config = plain(r.config);
  const protocol = plain(r.protocol);
  if (r.schema !== 'GYPSYAI_LOCAL_LONG_WORKLOAD_V3' ||
      r.origin !== 'loopback' || r.source !== 'ollama_self_report_browser_local' ||
      !stringVal(r.sessionId, 90) || !stringVal(r.startedAt, 50) ||
      !stringVal(r.finishedAt, 50) || !['completed', 'stopped', 'failed'].includes(String(r.status)) ||
      !stringVal(config.model) || ![2, 3].includes(config.repetitions as number) ||
      protocol.promptLabel !== 'fixed-neutral-extended-v1' ||
      !Array.isArray(protocol.caps) || protocol.caps.join(',') !== '128,256' ||
      protocol.temperature !== 0 || protocol.forcedCold !== false ||
      protocol.perCallTimeoutMs !== 120000 || protocol.responseTextRetained !== false ||
      !Array.isArray(r.observations) || r.observations.length > 8) {
    throw new Error('Not a supported bounded V3 session ledger.');
  }
  const obs: LongSample[] = r.observations.map((value: unknown, i: number) => {
    const x = plain(value);
    if (![128, 256].includes(x.cap as number) ||
        !['priming', 'measured'].includes(String(x.phase)) ||
        x.ordinal !== i + 1 || !num(x.browserElapsedMs) ||
        (x.browserElapsedMs as number) > 120001 ||
        (x.outputTokens !== null && (num(x.outputTokens) === null || (x.outputTokens as number) > (x.cap as number))) ||
        (x.promptTokens !== null && (num(x.promptTokens) === null || (x.promptTokens as number) > 10000))) {
      throw new Error('Invalid V3 observation at row ' + (i + 1));
    }
    for (const name of ['modelLoadMs', 'serverTotalMs', 'promptEvalMs', 'generationMs', 'generationTokensPerSecond']) {
      if (x[name] !== null && (num(x[name]) === null || (x[name] as number) > 1e9)) {
        throw new Error('Invalid V3 timing field.');
      }
    }
    const compactSnapshot = (rawSnap: unknown): ResidentSnapshot => {
      const snap = plain(rawSnap);
      if (!['observed', 'unavailable'].includes(String(snap.status)) ||
          (snap.loaded !== null && typeof snap.loaded !== 'boolean')) {
        throw new Error('Invalid V3 residency snapshot.');
      }
      return {
        checkedAt: stringVal(snap.checkedAt, 50) ?? '',
        status: snap.status as ResidentSnapshot['status'],
        loaded: snap.loaded as boolean | null,
        sizeBytes: num(snap.sizeBytes),
        sizeVramBytes: num(snap.sizeVramBytes),
        contextLength: num(snap.contextLength),
        error: stringVal(snap.error, 240)
      };
    };
    return {
      ordinal: i + 1, cap: x.cap as LongCap, phase: x.phase as LongPhase,
      browserElapsedMs: x.browserElapsedMs as number,
      modelLoadMs: x.modelLoadMs as number | null, serverTotalMs: x.serverTotalMs as number | null,
      promptEvalMs: x.promptEvalMs as number | null, generationMs: x.generationMs as number | null,
      promptTokens: x.promptTokens as number | null, outputTokens: x.outputTokens as number | null,
      generationTokensPerSecond: x.generationTokensPerSecond as number | null,
      doneReason: stringVal(x.doneReason, 80),
      reachedCap: x.outputTokens === x.cap,
      before: compactSnapshot(x.before), after: compactSnapshot(x.after)
    };
  });
  if (r.status === 'completed' && obs.length !== 2 * ((config.repetitions as number) + 1)) {
    throw new Error('Completed V3 ledger has incomplete observations.');
  }
  const order = planLongCohort(config.repetitions as 2 | 3);
  if (obs.some((o, i) => o.cap !== order[i].cap || o.phase !== order[i].phase)) {
    throw new Error('V3 observation order does not match the declared protocol.');
  }
  return {
    schema: 'GYPSYAI_LOCAL_LONG_WORKLOAD_V3',
    source: 'ollama_self_report_browser_local', origin: 'loopback',
    startedAt: r.startedAt as string, finishedAt: r.finishedAt as string,
    sessionId: r.sessionId as string,
    status: r.status as LongStatus, error: stringVal(r.error, 240),
    config: {
      model: config.model as string, digest: stringVal(config.digest, 128),
      ollamaVersion: stringVal(config.ollamaVersion, 80),
      repetitions: config.repetitions as 2 | 3
    },
    protocol: {
      promptLabel: 'fixed-neutral-extended-v1', caps: [128, 256],
      temperature: 0, forcedCold: false, perCallTimeoutMs: 120000,
      responseTextRetained: false
    },
    observations: obs, limitations: [...LONG_LIMITATIONS]
  };
}
export function compareLongSessions(sessions: LongLedger[]): SessionComparison {
  const a = sessions[0];
  const reasons: string[] = [];
  if (sessions.length < 2) reasons.push('Import or run at least two sessions to compare.');
  if (sessions.some((s) => s.status !== 'completed')) reasons.push('At least one session is partial or failed.');
  if (a && sessions.some((s) => s.config.model !== a.config.model)) reasons.push('Model names differ.');
  if (a && sessions.some((s) => !s.config.digest || !a.config.digest || s.config.digest !== a.config.digest)) {
    reasons.push('Model digests are missing or differ.');
  }
  if (a && sessions.some((s) => !s.config.ollamaVersion ||
      !a.config.ollamaVersion || s.config.ollamaVersion !== a.config.ollamaVersion)) {
    reasons.push('Ollama version differs or is missing.');
  }
  const duplicates = new Set(sessions.map((s) => s.sessionId));
  if (duplicates.size !== sessions.length) reasons.push('Duplicate session identifier detected.');
  if (sessions.some((s) => s.observations.some((r) => r.phase === 'measured' && r.outputTokens !== r.cap))) {
    reasons.push('Some measured outputs stopped before their target cap; work differs.');
  }
  return {
    compatible: reasons.length === 0,
    reasons,
    sessions: sessions.map((s) => ({
      sessionId: s.sessionId, startedAt: s.startedAt, status: s.status,
      summaries: summarizeLongLedger(s)
    }))
  };
}
