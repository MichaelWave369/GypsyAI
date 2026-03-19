import { describe, expect, it } from 'vitest';
import { exportTiekatV54Spec, getTiekatV54Metadata, TIEKAT_V54_SCORING_VERSION, TIEKAT_V54_SPEC_VERSION } from '@/lib/tiekat/v54';

describe('tiekat v54 metadata', () => {
  it('exports canonical metadata and spec shape', () => {
    const meta = getTiekatV54Metadata();
    const spec = exportTiekatV54Spec();

    expect(meta.specVersion).toBe(TIEKAT_V54_SPEC_VERSION);
    expect(meta.scoringVersion).toBe(TIEKAT_V54_SCORING_VERSION);
    expect(meta.provenanceRules).toContain('no_hardware_measurement_claims');
    expect(spec.historyEntryShape.required).toContain('scoringVersion');
    expect(spec.trendSemantics).toEqual(['rising', 'stable', 'falling']);
  });
});
