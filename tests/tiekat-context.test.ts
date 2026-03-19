import { describe, expect, it } from 'vitest';
import { buildTiekatContextEnvelope } from '@/lib/tiekat/core';

describe('tiekat context envelope', () => {
  const consent = { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false };

  it('applies ancestry and memory redactions', () => {
    const envelope = buildTiekatContextEnvelope({
      message: 'family lineage reading',
      consent,
      moduleData: {
        ancestry: { repeatingGivenNames: [['Alice', 2]], topBirthPlaces: [['London', 2]] },
        tarot: { spread: 'three-card', drawn: [{ card: { name: 'The Fool' }, orientation: 'upright', position: 'Past' }] }
      },
      memoryEntries: [{ key: 'k1', summary: 's', anchors: ['lineage'], modules: ['assistant'], updatedAt: '2026-01-01T00:00:00.000Z' }]
    });

    expect(envelope.moduleContext.ancestry).toBeUndefined();
    expect(envelope.memoryContext).toEqual([]);
    expect(envelope.redactionApplied).toEqual(expect.arrayContaining(['ancestry_blocked', 'memory_disabled', 'names_removed']));
    expect(envelope.symbolicAnchors).toContain('The Fool');
  });
});
