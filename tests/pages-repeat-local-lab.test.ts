import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  makeExperimentSchedule, validateExperimentConfig, runExperiment,
  parseLegacySampleJson, median, seriesStats, summarizeExperiment
} from '../site/src/repeatLab';
import type { ExperimentConfig } from '../site/src/repeatLab';
import type { LocalBenchmarkReceipt } from '../site/src/localLab';

afterEach(() => { vi.restoreAllMocks(); });

const sample = (model: string, rate = 100, count = 32): LocalBenchmarkReceipt => ({
  schema: 'GYPSYAI_LOCAL_OLLAMA_SAMPLE_V1',
  timestamp: '2026-10-28T05:29:33.381Z',
  model, origin: 'loopback', promptLabel: 'fixed-public-sample-v1',
  clientElapsedMs: 450, serverTotalMs: 445, modelLoadMs: 7,
  promptTokens: 27, generatedTokens: count, promptEvalMs: 120,
  generationMs: 300, reportedTokensPerSecond: rate,
  doneReason: 'length', interpretation: 'single_observation_not_benchmark'
});
const single: ExperimentConfig = {
  kind: 'post_warmup', modelA: 'granite4.2:8b', repetitions: 3, pairs: 2
};
const paired: ExperimentConfig = {
  kind: 'paired_exploratory', modelA: 'granite4.2:8b', modelB: 'gemma3:4b', repetitions: 3, pairs: 4
};

describe('v0.2.3 bounded local repeat lab', () => {
  it('plans initial priming separate from the measured warm candidates', () => {
    const schedule = makeExperimentSchedule(single);
    expect(schedule.map((s) => s.phase)).toEqual(['warmup','measurement','measurement','measurement']);
    expect(schedule.every((s) => s.model === single.modelA)).toBe(true);
    expect(makeExperimentSchedule({ ...single, repetitions: 5 })).toHaveLength(6);
    expect(() => makeExperimentSchedule({ ...single, repetitions: 100 as 3 })).toThrow();
  });
  it('balances two-model AB/BA order without a forced cold start', () => {
    const s = makeExperimentSchedule(paired);
    expect(s).toHaveLength(10);
    expect(s.slice(0, 2).map((x) => x.phase)).toEqual(['warmup', 'warmup']);
    expect(s.slice(2).map((x) => x.model === paired.modelA ? 'A' : 'B').join(''))
      .toBe('ABBA BAAB'.replace(/ /g, ''));
    expect(makeExperimentSchedule({ ...paired, pairs: 2 }).slice(2)
      .map((x) => x.model === paired.modelA ? 'A' : 'B').join('')).toBe('ABBA');
    expect(() => validateExperimentConfig(paired, [paired.modelA])).toThrow();
    expect(() => validateExperimentConfig({ ...paired, modelB: paired.modelA }, [paired.modelA])).toThrow();
  });
  it('rejects remote origins before any execution', async () => {
    const execute = vi.fn(async (_: string, model: string) => sample(model));
    await expect(runExperiment('https://example.com', single, [single.modelA], { execute }))
      .rejects.toThrow();
    expect(execute).not.toHaveBeenCalled();
  });
  it('runs bounded sequential calls after explicit invocation, retaining priming but excluding it from medians', async () => {
    const execute = vi.fn(async (_: string, model: string) => sample(model, 100 + execute.mock.calls.length));
    expect(execute).not.toHaveBeenCalled();
    const ledger = await runExperiment('http://127.0.0.1:11434', single, [single.modelA], { execute });
    expect(execute).toHaveBeenCalledTimes(4);
    expect(ledger.status).toBe('completed');
    expect(ledger.protocol.noForceCold).toBe(true);
    expect(ledger.observations[0].phase).toBe('warmup');
    expect(ledger.observations.slice(1).every((x) => x.phase === 'measurement')).toBe(true);
    const [summary] = summarizeExperiment(ledger);
    expect(summary.measured).toBe(3);
    expect(summary.total).toBe(4);
    expect(summary.metrics.clientElapsedMs?.median).toBe(450);
    expect(summary.metrics.reportedTokensPerSecond?.count).toBe(3);
    expect(JSON.stringify(ledger)).not.toContain('responseText');
  });
  it('stops after current request with partial exportable evidence and no hidden retry', async () => {
    let done = 0;
    const execute = vi.fn(async (_: string, model: string) => { done++; return sample(model); });
    const ledger = await runExperiment('http://localhost:11434', single, [single.modelA], {
      execute, shouldStop: () => done >= 2
    });
    expect(ledger.status).toBe('stopped');
    expect(ledger.observations).toHaveLength(2);
    expect(execute).toHaveBeenCalledTimes(2);
  });
  it('fails closed on bad model identity while preserving already-recorded samples', async () => {
    let i = 0;
    const ledger = await runExperiment('http://127.0.0.1:11434', single, [single.modelA], {
      execute: async (_: string, model: string) => sample(i++ === 0 ? model : 'unexpected')
    });
    expect(ledger.status).toBe('failed');
    expect(ledger.observations).toHaveLength(1);
    expect(ledger.error).toContain('mismatched');
  });
  it('computes median min max IQR without mutating input or manufacturing missing values', () => {
    const data = [7, 1, 6, 3, 12];
    expect(median(data)).toBe(6);
    expect(data).toEqual([7, 1, 6, 3, 12]);
    expect(seriesStats(data)).toEqual({
      count: 5, min: 1, median: 6, max: 12, iqr: 6, range: 11
    });
    expect(seriesStats([])).toBeNull();
    expect(seriesStats([Number.NaN])).toBeNull();
  });
  it('parses historical V1 receipts into a minimal allowlisted, unauthenticated record', () => {
    const imported = parseLegacySampleJson(JSON.stringify({
      ...sample('granite4.2:8b'), extra: '<private>', response: 'secret reply'
    }));
    expect(imported.model).toBe('granite4.2:8b');
    expect((imported as unknown as Record<string, unknown>).response).toBeUndefined();
    expect((imported as unknown as Record<string, unknown>).extra).toBeUndefined();
    expect(() => parseLegacySampleJson(JSON.stringify({ ...sample('granite4.2:8b'), origin: 'remote' }))).toThrow();
    expect(() => parseLegacySampleJson(JSON.stringify({ ...sample('granite4.2:8b'), clientElapsedMs: 'fast' }))).toThrow();
    expect(() => parseLegacySampleJson(JSON.stringify({ ...sample('granite4.2:8b'), generatedTokens: 1000 }))).toThrow();
    expect(() => parseLegacySampleJson('not json')).toThrow();
  });
  it('completes four balanced pairs with separate model summaries and no cross-model speedup claim', async () => {
    const ledger = await runExperiment('http://127.0.0.1:11434', paired,
      [paired.modelA, paired.modelB!],
      { execute: async (_: string, model: string) => sample(model, model === paired.modelA ? 100 : 80) });
    const summaries = summarizeExperiment(ledger);
    expect(ledger.observations).toHaveLength(10);
    expect(summaries.map((s) => s.measured)).toEqual([4, 4]);
    expect(ledger.caution.join(' ')).toContain('confound');
  });
});
