import { describe, expect, it } from 'vitest';
import { buildTiekatContextEnvelope } from '@/lib/tiekat/core';
import { createTiekatMemoryEntry } from '@/lib/tiekat/memory';

describe('tiekat memory stateless mode', () => {
  it('does not include memory when disabled', () => {
    const envelope = buildTiekatContextEnvelope({
      message: 'tarot reflection',
      consent: { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false },
      memoryEntries: [{ key: 'k1', summary: 'old', anchors: ['tarot'], modules: ['assistant'], updatedAt: '2026-01-01T00:00:00.000Z' }]
    });

    expect(envelope.memoryContext).toEqual([]);
    expect(envelope.redactionApplied).toContain('memory_disabled');
  });

  it('stores compact gravity summaries when available', () => {
    const entry = createTiekatMemoryEntry(
      's1',
      'summary',
      ['tarot'],
      ['assistant', 'tarot'],
      {
        status: 'theoretical',
        enabled: true,
        lambdaI: 0.75,
        baselineMatterDensity: 1,
        informationIntegral: 0.44,
        deltaGPredicted: 1.23e-10,
        deltaGBand: { min: 1e-10, max: 2e-10 },
        classicalLimitReached: false,
        confidenceNote: 'Experimental symbolic gravity layer; not a physical sensor measurement.',
        sourceMode: 'modeled_internal_signal',
        contributingAnchors: ['tarot'],
        contributingModules: ['assistant', 'tarot'],
        modelVersion: 'gravity-bootstrap-v1'
      }
    );

    expect(entry.gravitySummary?.deltaGPredicted).toBe(1.23e-10);
    expect(entry.gravitySummary?.status).toBe('theoretical');
  });
});
