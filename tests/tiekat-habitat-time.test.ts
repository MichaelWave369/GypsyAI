import { describe, expect, it } from 'vitest';
import {
  classifyHabitatRecency,
  classifyHabitatUsage,
  formatHabitatLastAppliedLabel,
  formatHabitatRelativeTime,
  formatHabitatUsageBadge
} from '@/lib/tiekat/habitatTime';

describe('tiekat habitat time semantics', () => {
  it('formats deterministic compact relative-time labels', () => {
    const now = '2026-03-20T00:00:00.000Z';
    expect(formatHabitatRelativeTime('2026-03-20T00:00:00.000Z', now)).toBe('just now');
    expect(formatHabitatRelativeTime('2026-03-19T23:55:00.000Z', now)).toBe('5m ago');
    expect(formatHabitatRelativeTime('2026-03-19T22:00:00.000Z', now)).toBe('2h ago');
    expect(formatHabitatRelativeTime('2026-03-17T00:00:00.000Z', now)).toBe('3d ago');
  });

  it('renders never-applied label safely', () => {
    expect(formatHabitatRelativeTime(null, '2026-03-20T00:00:00.000Z')).toBe('never applied');
    expect(formatHabitatLastAppliedLabel({ lastAppliedAt: null }, '2026-03-20T00:00:00.000Z')).toBe('Never applied');
  });

  it('classifies recency and usage continuity status deterministically', () => {
    const now = '2026-03-20T00:00:00.000Z';
    expect(classifyHabitatRecency(null, now)).toBe('never_applied');
    expect(classifyHabitatRecency('2026-03-20T00:00:00.000Z', now)).toBe('just_now');
    expect(classifyHabitatRecency('2026-03-19T12:00:00.000Z', now)).toBe('recent');
    expect(classifyHabitatRecency('2026-03-18T12:00:00.000Z', now)).toBe('aging');
    expect(classifyHabitatRecency('2026-03-01T00:00:00.000Z', now)).toBe('stale');

    expect(classifyHabitatUsage({ applyCount: 0, lastAppliedAt: null }, now)).toBe('never_applied');
    expect(classifyHabitatUsage({ applyCount: 1, lastAppliedAt: '2026-03-18T23:00:00.000Z' }, now)).toBe('recently_active');
    expect(classifyHabitatUsage({ applyCount: 5, lastAppliedAt: '2026-03-19T23:00:00.000Z' }, now)).toBe('frequently_used');
    expect(classifyHabitatUsage({ applyCount: 2, lastAppliedAt: '2026-03-01T00:00:00.000Z' }, now)).toBe('stale');
    expect(formatHabitatUsageBadge('frequently_used')).toBe('Frequently Used');
  });

  it('keeps labels compact and free of private/raw content', () => {
    const label = formatHabitatLastAppliedLabel({ lastAppliedAt: '2026-03-20T00:00:00.000Z' }, '2026-03-20T00:00:00.000Z');
    expect(label).toBe('Last applied just now');
    expect(label.toLowerCase()).not.toContain('message');
    expect(label.toLowerCase()).not.toContain('ancestor name');
  });
});
