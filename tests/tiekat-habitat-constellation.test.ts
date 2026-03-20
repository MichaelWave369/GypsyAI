import { describe, expect, it } from 'vitest';
import {
  buildHabitatConstellationEdges,
  buildHabitatConstellationNodes,
  buildHabitatConstellationState,
  buildHabitatConstellationSummary
} from '@/lib/tiekat/habitatConstellation';
import { buildDefaultHabitatProfiles, normalizeHabitatProfile } from '@/lib/tiekat/habitatProfile';

describe('tiekat habitat constellation', () => {
  it('builds deterministic constellation nodes from local usage metadata', () => {
    const defaults = buildDefaultHabitatProfiles();
    const profiles = [
      normalizeHabitatProfile({ ...defaults[2], applyCount: 6, lastAppliedAt: '2026-03-20T00:00:00.000Z' }),
      normalizeHabitatProfile({ ...defaults[3], applyCount: 2, lastAppliedAt: '2026-03-19T20:00:00.000Z', pinned: true }),
      normalizeHabitatProfile({ ...defaults[0], applyCount: 0, lastAppliedAt: null, pinned: true })
    ];
    const a = buildHabitatConstellationNodes({ profiles, now: '2026-03-20T00:05:00.000Z' });
    const b = buildHabitatConstellationNodes({ profiles, now: '2026-03-20T00:05:00.000Z' });
    expect(a).toEqual(b);
    expect(a[0].name).toBe('Synthesis Oracle');
    expect(a[0].intensity).toBe('high');
    expect(a[2].recency).toBe('never_applied');
  });

  it('builds recent transition edge when transition metadata is available', () => {
    const defaults = buildDefaultHabitatProfiles();
    const nodes = buildHabitatConstellationNodes({
      profiles: [
        normalizeHabitatProfile({ ...defaults[2], applyCount: 5, lastAppliedAt: '2026-03-20T00:00:00.000Z' }),
        normalizeHabitatProfile({ ...defaults[3], applyCount: 3, lastAppliedAt: '2026-03-19T22:00:00.000Z' })
      ],
      now: '2026-03-20T00:05:00.000Z'
    });
    const edges = buildHabitatConstellationEdges({
      nodes,
      recentTransition: { from: 'Council Deliberation', to: 'Synthesis Oracle' }
    });
    expect(edges[0]?.label).toBe('Council Deliberation → Synthesis Oracle');
  });

  it('summarizes dominant/pinned-inactive/no-history states compactly without private leakage', () => {
    const defaults = buildDefaultHabitatProfiles();
    const noHistory = buildHabitatConstellationSummary({
      state: buildHabitatConstellationState({ profiles: defaults.map((profile) => ({ ...profile, applyCount: 0, lastAppliedAt: null })) })
    });
    expect(noHistory.headline).toContain('No habitat transition history yet');

    const state = buildHabitatConstellationState({
      profiles: [
        normalizeHabitatProfile({ ...defaults[2], applyCount: 6, lastAppliedAt: '2026-03-20T00:00:00.000Z' }),
        normalizeHabitatProfile({ ...defaults[0], applyCount: 0, lastAppliedAt: null, pinned: true })
      ],
      recentTransition: { from: 'Quiet Reflection', to: 'Synthesis Oracle' }
    });
    const summary = buildHabitatConstellationSummary({ state });
    expect(summary.headline).toContain('Synthesis Oracle');
    expect(summary.line).toContain('Pinned habitats are present');
    expect(summary.pairLine).toContain('Quiet Reflection → Synthesis Oracle');
    expect(summary.line.toLowerCase()).not.toContain('message');
    expect(summary.line.toLowerCase()).not.toContain('ancestor name');
  });
});
