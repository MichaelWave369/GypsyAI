import { describe, expect, it } from 'vitest';
import { buildDefaultHabitatProfiles } from '@/lib/tiekat/habitatProfile';
import { buildHabitatTransition, buildHabitatTransitionChips, resolveHabitatShortcut, summarizeHabitatTransition } from '@/lib/tiekat/habitatTransition';

describe('tiekat habitat transition', () => {
  it('builds deterministic transition model and compressed chips', () => {
    const defaults = buildDefaultHabitatProfiles();
    const current = defaults[0];
    const target = defaults[4];
    const a = buildHabitatTransition({ current, target, allowAncestry: true });
    const b = buildHabitatTransition({ current, target, allowAncestry: true });
    expect(a).toEqual(b);
    expect(a.chips.length).toBeLessThanOrEqual(5);
    expect(a.summary.headline).toContain('Transitioning from');
  });

  it('adds consent-safe fallback chip when ancestry mode is disallowed', () => {
    const current = buildDefaultHabitatProfiles()[0];
    const target = {
      ...buildDefaultHabitatProfiles()[0],
      name: 'Ancestral Habitat',
      preferences: {
        ...buildDefaultHabitatProfiles()[0].preferences,
        sessionMode: 'ancestral_listening' as const
      }
    };
    const chips = buildHabitatTransitionChips({ current, target, allowAncestry: false });
    expect(chips[0]?.key).toBe('ancestry_fallback');
    expect(chips[0]?.label.toLowerCase()).toContain('consent fallback');
  });

  it('summarizes transition with compact config-only text', () => {
    const summary = summarizeHabitatTransition({
      fromProfileName: 'Quiet Reflection',
      toProfileName: 'Council Deliberation',
      chips: [{ key: 'diagnostics', label: 'Diagnostics: off → on', severity: 'medium' }]
    });
    expect(summary.headline).toContain('Transitioning from Quiet Reflection to Council Deliberation');
    expect(summary.line).toContain('This shift emphasizes');
    expect(summary.line).not.toContain('message');
    expect(summary.line).not.toContain('ancestor name');
  });

  it('resolves keyboard shortcuts only for eligible contexts', () => {
    expect(resolveHabitatShortcut({ key: 'p', altKey: true, shiftKey: true, targetTag: 'div' })).toBe('toggle_pin');
    expect(resolveHabitatShortcut({ key: 'ArrowDown', altKey: true, shiftKey: true, targetTag: 'div' })).toBe('move_down');
    expect(resolveHabitatShortcut({ key: 'a', altKey: true, shiftKey: true, targetTag: 'textarea' })).toBeNull();
    expect(resolveHabitatShortcut({ key: 'a', altKey: false, shiftKey: true, targetTag: 'div' })).toBeNull();
  });
});
