import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = {
  gravityHistory: [] as any[]
};

vi.mock('@/lib/local/db', () => ({
  dbGet: async (store: string) => (db as any)[store] ?? null,
  dbSet: async (store: string, value: unknown) => {
    (db as any)[store] = value;
  }
}));

import {
  appendGravityHistoryEntry,
  getRecentGravityHistory,
  groupGravityHistoryByScoringVersion,
  loadGravityHistory,
  summarizeGravityTrend
} from '@/lib/tiekat/gravityHistory';
import { normalizeGravityHistory } from '@/lib/tiekat/gravityVersioning';

describe('tiekat gravity history', () => {
  beforeEach(() => {
    db.gravityHistory = [];
  });

  it('persists compact history entries through IndexedDB path', async () => {
    await appendGravityHistoryEntry({
      enabled: true,
      sessionId: 's1',
      route: 'assistant_synthesis',
      mode: 'assistant_synthesis',
      gravity: {
        status: 'theoretical',
        enabled: true,
        lambdaI: 0.75,
        baselineMatterDensity: 1,
        informationIntegral: 0.5,
        deltaGPredicted: 1.2e-10,
        deltaGBand: { min: 1e-10, max: 1.4e-10 },
        classicalLimitReached: false,
        confidenceNote: 'Experimental symbolic gravity layer; not a physical sensor measurement.',
        sourceMode: 'modeled_internal_signal',
        contributingAnchors: ['sun'],
        contributingModules: ['assistant', 'tarot'],
        modelVersion: 'gravity-bootstrap-v1',
        scoringVersion: 'v1'
      }
    });

    const rows = await loadGravityHistory();
    expect(rows).toHaveLength(1);
    expect(rows[0].scoringVersion).toBe('v1');
    expect(rows[0].sourceMode).toBe('modeled_internal_signal');
  });

  it('skips persistence when memory/history is disabled', async () => {
    await appendGravityHistoryEntry({
      enabled: false,
      sessionId: 's1',
      route: 'assistant_synthesis',
      mode: 'assistant_synthesis',
      gravity: {
        status: 'theoretical',
        enabled: true,
        lambdaI: 0.75,
        baselineMatterDensity: 1,
        informationIntegral: 0.5,
        deltaGPredicted: 1.2e-10,
        deltaGBand: { min: 1e-10, max: 1.4e-10 },
        classicalLimitReached: false,
        confidenceNote: 'Experimental symbolic gravity layer; not a physical sensor measurement.',
        sourceMode: 'modeled_internal_signal',
        contributingAnchors: [],
        contributingModules: ['assistant'],
        modelVersion: 'gravity-bootstrap-v1',
        scoringVersion: 'v1'
      }
    });

    expect(await loadGravityHistory()).toEqual([]);
  });

  it('normalizes legacy rows and supports version grouping + trends', async () => {
    db.gravityHistory = [
      { sessionId: 'legacy', timestamp: '2026-01-01T00:00:00.000Z', deltaGPredicted: 1e-10 },
      { id: 'n1', sessionId: 'new', timestamp: '2026-01-02T00:00:00.000Z', scoringVersion: 'v1', deltaGPredicted: 2e-10, informationIntegral: 0.6, deltaGBand: { min: 1.8e-10, max: 2.2e-10 }, contributingModules: ['assistant'], status: 'theoretical', route: 'assistant_synthesis', mode: 'assistant_synthesis', sourceMode: 'modeled_internal_signal', rowVersion: 1 }
    ];

    const normalized = normalizeGravityHistory(db.gravityHistory);
    expect(normalized[0].scoringVersion).toBe('v1');

    const grouped = groupGravityHistoryByScoringVersion(normalized);
    expect(grouped.v1.length).toBe(2);

    const recent = await getRecentGravityHistory(2);
    const trend = summarizeGravityTrend(recent);
    expect(trend.trend).toBe('rising');
  });
});
