import { describe, expect, it } from 'vitest';
import { buildTiekatContextEnvelope } from '@/lib/tiekat/core';

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
});
