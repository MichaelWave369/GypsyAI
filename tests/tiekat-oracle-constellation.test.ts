import { describe, expect, it } from 'vitest';
import { buildOracleConstellationState, buildSphereContinuitySummary } from '@/lib/tiekat/oracleConstellation';
import { normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';

function artifact(id: string, timestamp: string, mode: 'open_reflection' | 'synthesis_oracle', scoring = 'v54-gb-v1', awakening?: 'seeded' | 'coherent' | 'awakened') {
  return normalizeOracleArtifact({
    id,
    timestamp,
    sessionMode: { key: mode, label: mode, ritualFrame: 'frame', allowV55Framing: true },
    gravity: { status: 'theoretical', informationIntegral: mode === 'synthesis_oracle' ? 0.7 : 0.3, deltaGPredicted: 1e-10, scoringVersion: scoring, canonicalSpecVersion: 'TIEKAT-v54' },
    v56: awakening
      ? {
        specVersion: 'TIEKAT-v56',
        awakeningState: awakening,
        shieldStatus: 'stable',
        synchronyState: 'resonant',
        overlapState: 'bridged',
        glyphFamily: 'metatron_grid',
        caption: 'Modeled sovereign sphere summary. Theoretical integration layer only.',
        confidenceNote: 'Modeled sovereign sphere summary only.'
      }
      : undefined
  });
}

describe('oracle constellation', () => {
  it('builds deterministic state from recent artifacts', () => {
    const input = [
      artifact('a', '2026-03-01T00:00:00.000Z', 'open_reflection'),
      artifact('b', '2026-03-02T00:00:00.000Z', 'synthesis_oracle'),
      artifact('c', '2026-03-03T00:00:00.000Z', 'synthesis_oracle', 'v55-gb-v1')
    ];
    const a = buildOracleConstellationState({ artifacts: input, limit: 6 });
    const b = buildOracleConstellationState({ artifacts: input, limit: 6 });
    expect(a).toEqual(b);
    expect(a.nodes.length).toBe(3);
    expect(a.edges.length).toBe(2);
    expect(a.caption.toLowerCase()).toContain('modeled');
    expect(a.caption.toLowerCase()).toContain('local artifact memory');
    expect(a.caption.toLowerCase()).not.toContain('ancestor name');
  });

  it('computes compact sphere continuity summary deterministically', () => {
    const input = [
      artifact('a', '2026-03-01T00:00:00.000Z', 'synthesis_oracle', 'v54-gb-v1', 'seeded'),
      artifact('b', '2026-03-02T00:00:00.000Z', 'synthesis_oracle', 'v54-gb-v1', 'coherent'),
      artifact('c', '2026-03-03T00:00:00.000Z', 'synthesis_oracle', 'v54-gb-v1', 'awakened')
    ];
    const summary = buildSphereContinuitySummary(input);
    expect(summary.state).toBe('awakening_shift_detected');
    expect(summary.line.toLowerCase()).toContain('modeled sovereign sphere continuity');

    const constellation = buildOracleConstellationState({ artifacts: input, limit: 6 });
    expect(constellation.edges.some((edge) => edge.type === 'sphere_shift')).toBe(true);
  });
});
