import { describe, expect, it } from 'vitest';
import { buildTiekatContextEnvelope, buildTiekatReflectionPlan, buildTiekatSessionState } from '@/lib/tiekat/core';

describe('tiekat assistant kernel integration', () => {
  const consent = { allowAncestry: true, includeNames: false, hideLivingPersons: true, memoryEnabled: true };

  it('builds deterministic route, session, and plan', () => {
    const first = buildTiekatSessionState('session-1', 'Blend tarot and transits', consent);
    const second = buildTiekatSessionState('session-1', 'Blend tarot and transits', consent);

    const envelope = buildTiekatContextEnvelope({
      message: 'Blend tarot and transits',
      consent,
      moduleData: {
        tarot: { spread: 'three-card', drawn: [{ card: { name: 'The Star' }, orientation: 'upright', position: 'Now' }] }
      },
      memoryEntries: [{ key: 'm1', summary: 'prior star insight', anchors: ['star', 'tarot'], modules: ['assistant', 'tarot'], updatedAt: '2026-01-01T00:00:00.000Z' }]
    });
    const plan = buildTiekatReflectionPlan(first.state, envelope);

    expect(first.routing).toEqual(second.routing);
    expect(plan.modulesToConsult).toEqual(expect.arrayContaining(['assistant', 'tarot', 'astrology']));
    expect(plan.mode).toBe('blended');
    expect(plan.memoryKeysUsed).toContain('m1');
  });
});
