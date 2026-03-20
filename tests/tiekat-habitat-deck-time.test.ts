import { describe, expect, it } from 'vitest';
import { formatHabitatDeckRelativeTime, formatHabitatDeckSavedLabel } from '@/lib/tiekat/habitatDeckTime';

describe('tiekat habitat deck time', () => {
  it('formats deterministic compact saved-time labels', () => {
    const now = '2026-03-20T00:10:00.000Z';
    expect(formatHabitatDeckRelativeTime('2026-03-20T00:10:00.000Z', now)).toBe('just now');
    expect(formatHabitatDeckRelativeTime('2026-03-20T00:05:00.000Z', now)).toBe('5m ago');
    expect(formatHabitatDeckRelativeTime('2026-03-19T22:10:00.000Z', now)).toBe('2h ago');
    expect(formatHabitatDeckRelativeTime('2026-03-17T00:10:00.000Z', now)).toBe('3d ago');
  });

  it('builds saved labels without private/raw leakage', () => {
    const label = formatHabitatDeckSavedLabel({ createdAt: '2026-03-20T00:10:00.000Z' }, '2026-03-20T00:10:00.000Z');
    expect(label).toBe('saved just now');
    expect(label.toLowerCase()).not.toContain('message');
    expect(label.toLowerCase()).not.toContain('ancestor name');
  });
});
