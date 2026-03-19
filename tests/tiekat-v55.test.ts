import { describe, expect, it } from 'vitest';
import { exportTiekatV55Spec, getTiekatV55Metadata, TIEKAT_V55_SPEC_VERSION } from '@/lib/tiekat/v55';

describe('tiekat v55 metadata', () => {
  it('exports canonical conceptual framing metadata', () => {
    const metadata = getTiekatV55Metadata();
    const spec = exportTiekatV55Spec();

    expect(metadata.specVersion).toBe(TIEKAT_V55_SPEC_VERSION);
    expect(metadata.status).toBe('conceptual');
    expect(metadata.framingRules).toContain('v54_runtime_is_operational');
    expect(spec.presentationContract.optionalFraming).toBe(true);
  });
});
