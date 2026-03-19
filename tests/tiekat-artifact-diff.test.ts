import { describe, expect, it } from 'vitest';
import { buildOracleArtifactDiffView, normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';

describe('oracle artifact diff', () => {
  it('builds compact deterministic diff lines', () => {
    const a = normalizeOracleArtifact({
      id: 'a',
      route: 'assistant_synthesis',
      sessionMode: { key: 'open_reflection', label: 'Open Reflection', ritualFrame: 'frame a', allowV55Framing: true },
      activeModules: ['assistant'],
      gravity: { status: 'theoretical', informationIntegral: 0.3, deltaGPredicted: 1e-10, scoringVersion: 'v54-gb-v1', canonicalSpecVersion: 'TIEKAT-v54' },
      trend: 'stable'
    });
    const b = normalizeOracleArtifact({
      id: 'b',
      route: 'tarot_focused',
      sessionMode: { key: 'tarot_inquiry', label: 'Tarot Inquiry', ritualFrame: 'frame b', allowV55Framing: true },
      activeModules: ['assistant', 'tarot'],
      gravity: { status: 'theoretical', informationIntegral: 0.5, deltaGPredicted: 1.5e-10, scoringVersion: 'v55-gb-v1', canonicalSpecVersion: 'TIEKAT-v54' },
      trend: 'rising',
      v55: { specVersion: 'TIEKAT-v55', enabled: true }
    });

    const diff = buildOracleArtifactDiffView(a, b);
    expect(diff.title).toBe('What changed');
    expect(diff.lines.length).toBeGreaterThanOrEqual(8);
    expect(diff.lines.join(' ')).toContain('Session mode');
    expect(diff.lines.join(' ')).toContain('ΔI');
    expect(diff.lines.join(' ').toLowerCase()).not.toContain('diagnostics');
  });
});
