import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeGravityHistory } from '@/lib/tiekat/gravityVersioning';
import { buildVersionComparisonSummary } from '@/lib/tiekat/gravityHistory';

describe('gravity mixed-version backup fixture normalization', () => {
  it('normalizes mixed-version gravityHistory rows from backup fixtures', () => {
    const fixturePath = path.resolve(__dirname, 'fixtures/gravity-history-mixed-backup.json');
    const payload = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    const normalized = normalizeGravityHistory(payload.data.gravityHistory);

    expect(normalized).toHaveLength(3);
    expect(normalized[0].scoringVersion).toBe('v54-gb-v1');
    expect(normalized[0].rowVersion).toBe(1);
    expect(normalized[0].canonicalSpecVersion).toBe('TIEKAT-v54');
    expect(normalized[2].rowVersion).toBe(1);
    expect(normalized[2].canonicalSpecVersion).toBe('TIEKAT-v54');

    const summary = buildVersionComparisonSummary(normalized, 'v54-gb-v1');
    expect(summary.state).toBe('drift_detected');
    expect(summary.versionCount).toBeGreaterThan(1);
  });
});
