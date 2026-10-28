/**
 * GypsyAI v0.2.6 PocketBrain comparison studio.
 * Only an operator-approved, already-loaded PocketBrain Tiny browser client executes.
 * No prompt or model-generated text enters the exportable ledger.
 */
import { normalizeTinyReceipt, POCKETBRAIN_SOURCE } from './sovereignBridge';
import type { PocketBrainEvidence, TinyClient, TinyMode } from './sovereignBridge';
import { seriesStats } from './repeatLab';
import type { SeriesStats } from './repeatLab';

export const PAIR_PROMPT =
  'Explain in two simple sentences why repeatable scientific observations matter.';
export const PAIR_PROMPT_LABEL = 'fixed-public-observation-v1' as const;
export const PAIR_TOKEN_CAP = 64 as const;
export type PairPhase = 'priming' | 'measured';
export type PairStatus = 'completed' | 'stopped' | 'failed';
export interface PairRequest {
  phase: PairPhase;
  mode: TinyMode;
  label: string;
}
export interface PairObservation {
  index: number;
  phase: PairPhase;
  mode: TinyMode;
  label: string;
  evidence: PocketBrainEvidence;
}
export interface PairLocalAnswer {
  index: number;
  phase: PairPhase;
  mode: TinyMode;
  text: string;
}
export interface PairLedger {
  schema: 'GYPSYAI_POCKETBRAIN_PAIR_V1';
  source: 'browser_operator_approved_experimental';
  startedAt: string;
  finishedAt: string;
  sessionId: string;
  status: PairStatus;
  error: string | null;
  protocol: {
    promptLabel: typeof PAIR_PROMPT_LABEL;
    promptLengthChars: number;
    tokenCap: typeof PAIR_TOKEN_CAP;
    temperatureStrategy: 'pocketbrain_sdk_deterministic_baseline_vs_guarded';
    repetitions: 2 | 4;
    schedule: 'prime_AB_then_AB_BA' | 'prime_AB_then_AB_BA_BA_AB';
    modelUnloadedBetweenModes: false;
    inputOutputTextIncluded: false;
  };
  model: string | null;
  device: string | null;
  dtype: string | null;
  sdk: string;
  sourceBlobs: typeof POCKETBRAIN_SOURCE.sourceBlobShas;
  observations: PairObservation[];
  limitations: string[];
}
export interface PairSummary {
  mode: TinyMode;
  measuredCount: number;
  callbackCounts: number[];
  outputCharacters: number[];
  wallMs: SeriesStats | null;
  firstCallbackMs: SeriesStats | null;
  firstVisibleMs: SeriesStats | null;
  callbackRatePerWall: SeriesStats | null;
}
export interface PairExecution {
  ledger: PairLedger;
  answers: PairLocalAnswer[];
}
export interface PairHooks {
  onProgress?: (observations: PairObservation[], answers: PairLocalAnswer[], done: number, total: number) => void;
  shouldStop?: () => boolean;
}
const LIMITATIONS = [
  'Self-reported browser execution receipt, not a verified GPU profiler measurement or model-output reference parity.',
  'JS token callback events are not an independently verified count of model-generated tokens.',
  'Model outputs can terminate early or differ in length. Wall-time comparisons therefore do not isolate decoding speed.',
  'Fixed short prompt and two/four measured observations per mode provide descriptive statistics, not statistical significance.',
  'Sequential execution and priming reduce first-run effects but cannot control temperature, caching, scheduling or hardware contention.',
  'Guarded decoding changes token selection and may change answer length or quality; neither mode is declared superior.',
  'The checkpoint and tokenizer artifacts are unpinned; source blob revisions identify only the copied JavaScript.',
  'Model-generated text and public prompt body are kept in the live tab only, never exported in the measurement ledger.'
];

export function planPocketBrainPairs(rounds: 2 | 4): PairRequest[] {
  if (rounds !== 2 && rounds !== 4) throw new Error('Choose exactly 2 or 4 balanced rounds.');
  const orders = rounds === 2 ? ['AB', 'BA'] : ['AB', 'BA', 'BA', 'AB'];
  return [
    { phase: 'priming', mode: 'baseline', label: 'Baseline priming request' },
    { phase: 'priming', mode: 'guarded', label: 'Guarded priming request' },
    ...orders.flatMap((order, i) => Array.from(order).map((letter) => ({
      phase: 'measured' as const,
      mode: letter === 'A' ? 'baseline' as const : 'guarded' as const,
      label: 'Round ' + (i + 1) + ' · ' + (letter === 'A' ? 'Baseline' : 'Guarded')
    })))
  ];
}
function finite(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0;
}
function numericField(row: PairObservation, field: string): number | null {
  const x = row.evidence.engineReceipt[field];
  return finite(x) ? x : null;
}
function caught(e: unknown): string {
  return (e instanceof Error ? e.message : 'PocketBrain inference failed.').slice(0, 200);
}
export function summarizePocketBrainPairs(ledger: PairLedger): PairSummary[] {
  return (['baseline', 'guarded'] as const).map((mode) => {
    const rows = ledger.observations.filter((o) => o.mode === mode && o.phase === 'measured');
    const get = (field: string) => rows.map((r) => numericField(r, field)).filter((n): n is number => n !== null);
    return {
      mode,
      measuredCount: rows.length,
      callbackCounts: get('observedTokenCallbackEvents'),
      outputCharacters: get('outputCharCount'),
      wallMs: seriesStats(get('generationWallMs')),
      firstCallbackMs: seriesStats(get('timeToFirstTokenCallbackMs')),
      firstVisibleMs: seriesStats(get('timeToFirstVisibleTextMs')),
      callbackRatePerWall: seriesStats(get('callbackEventsPerSecondFullWall'))
    };
  });
}
export async function runPocketBrainPairs(
  client: TinyClient,
  rounds: 2 | 4,
  hooks: PairHooks = {}
): Promise<PairExecution> {
  const status = client.getStatus();
  if (!status.ready || status.phase !== 'ready' ||
      status.model !== POCKETBRAIN_SOURCE.modelId ||
      !['webgpu', 'wasm'].includes(status.device || '')) {
    throw new Error('Load a compatible PocketBrain Tiny model explicitly before a comparison.');
  }
  const schedule = planPocketBrainPairs(rounds);
  const startedAt = new Date().toISOString();
  const observations: PairObservation[] = [];
  const answers: PairLocalAnswer[] = [];
  let finalStatus: PairStatus = 'completed';
  let error: string | null = null;
  for (const step of schedule) {
    if (hooks.shouldStop?.()) { finalStatus = 'stopped'; break; }
    try {
      const result = await client.generate(PAIR_PROMPT, {
        mode: step.mode,
        maxNewTokens: PAIR_TOKEN_CAP
      });
      if (typeof result.text !== 'string' || !result.text.trim()) {
        throw new Error('PocketBrain returned an empty response.');
      }
      const evidence = normalizeTinyReceipt(result.receipt, client.getStatus(), step.mode, PAIR_TOKEN_CAP);
      if (evidence.model !== status.model || evidence.device !== status.device) {
        throw new Error('PocketBrain identity or device changed during the comparison.');
      }
      // Strictly separate the ephemeral answer from exportable numeric evidence.
      const index = observations.length + 1;
      observations.push({ index, phase: step.phase, mode: step.mode, label: step.label, evidence });
      answers.push({ index, phase: step.phase, mode: step.mode, text: result.text.slice(0, 5000) });
      hooks.onProgress?.([...observations], [...answers], observations.length, schedule.length);
    } catch (e) {
      finalStatus = 'failed';
      error = caught(e);
      break; // No silent retry, no alternative provider or private prompt handoff.
    }
  }
  return {
    ledger: {
      schema: 'GYPSYAI_POCKETBRAIN_PAIR_V1',
      source: 'browser_operator_approved_experimental',
      startedAt, finishedAt: new Date().toISOString(),
      sessionId: 'tiny-pair-' + startedAt.replace(/[^0-9]/g, '').slice(0, 17),
      status: finalStatus,
      error,
      protocol: {
        promptLabel: PAIR_PROMPT_LABEL,
        promptLengthChars: PAIR_PROMPT.length,
        tokenCap: PAIR_TOKEN_CAP,
        temperatureStrategy: 'pocketbrain_sdk_deterministic_baseline_vs_guarded',
        repetitions: rounds,
        schedule: rounds === 2 ? 'prime_AB_then_AB_BA' : 'prime_AB_then_AB_BA_BA_AB',
        modelUnloadedBetweenModes: false,
        inputOutputTextIncluded: false
      },
      model: status.model,
      device: status.device,
      dtype: status.dtype,
      sdk: POCKETBRAIN_SOURCE.sdkVersion,
      sourceBlobs: POCKETBRAIN_SOURCE.sourceBlobShas,
      observations,
      limitations: [...LIMITATIONS]
    },
    answers
  };
}
