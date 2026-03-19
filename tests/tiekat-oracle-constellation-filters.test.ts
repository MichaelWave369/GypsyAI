import { describe, expect, it } from 'vitest';
import {
  applyConstellationFilters,
  buildOracleConstellationState,
  getConstellationFilterOptions,
  loadConstellationFilters,
  saveConstellationFilters
} from '@/lib/tiekat/oracleConstellation';
import { normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';

function mk(id: string, ts: string, mode: string, scoring: string) {
  return normalizeOracleArtifact({
    id,
    timestamp: ts,
    sessionMode: { key: mode as any, label: mode, ritualFrame: 'frame', allowV55Framing: true },
    gravity: { status: 'theoretical', informationIntegral: mode === 'synthesis_oracle' ? 0.7 : 0.35, deltaGPredicted: 1e-10, scoringVersion: scoring, canonicalSpecVersion: 'TIEKAT-v54' }
  });
}

describe('oracle constellation filters', () => {
  const state = buildOracleConstellationState({
    artifacts: [
      mk('a', '2026-03-01T00:00:00.000Z', 'open_reflection', 'v54-gb-v1'),
      mk('b', '2026-03-02T00:00:00.000Z', 'synthesis_oracle', 'v54-gb-v1'),
      mk('c', '2026-03-03T00:00:00.000Z', 'synthesis_oracle', 'v55-gb-v1')
    ]
  });

  it('derives filter options deterministically', () => {
    const options = getConstellationFilterOptions(state);
    expect(options.modes).toContain('synthesis_oracle');
    expect(options.scoringVersions).toContain('v54-gb-v1');
    expect(options.shiftTypes.length).toBeGreaterThan(0);
  });

  it('filters by mode, scoring version, and shift type', () => {
    const byMode = applyConstellationFilters(state, { mode: 'synthesis_oracle', scoringVersion: 'all', shiftType: 'all' });
    expect(byMode.nodes.every((n) => n.mode === 'synthesis_oracle')).toBe(true);

    const byVersion = applyConstellationFilters(state, { mode: 'all', scoringVersion: 'v55-gb-v1', shiftType: 'all' });
    expect(byVersion.nodes.every((n) => n.scoringVersion === 'v55-gb-v1')).toBe(true);

    const byShift = applyConstellationFilters(state, { mode: 'all', scoringVersion: 'all', shiftType: 'version_shift' });
    expect(byShift.edges.every((e) => e.type === 'version_shift')).toBe(true);
  });

  it('supports empty-state filtered result and local filter persistence', () => {
    const empty = applyConstellationFilters(state, { mode: 'no-mode', scoringVersion: 'all', shiftType: 'all' });
    expect(empty.nodes.length).toBe(0);
    expect(empty.caption.toLowerCase()).toContain('no recent artifacts');

    const store: Record<string, string> = {};
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        }
      }
    };
    saveConstellationFilters({ mode: 'synthesis_oracle', scoringVersion: 'all', shiftType: 'all' });
    expect(loadConstellationFilters().mode).toBe('synthesis_oracle');
  });
});
