import { beforeEach, describe, expect, it, vi } from 'vitest';

const db: Record<string, unknown> = {};

vi.mock('@/lib/local/db', () => ({
  dbGet: vi.fn(async (store: string) => (store in db ? db[store] : null)),
  dbSet: vi.fn(async (store: string, value: unknown) => {
    db[store] = value;
  })
}));

import {
  appendHabitatProfile,
  applyHabitatProfile,
  buildHabitatProfileDiff,
  compareHabitatProfiles,
  buildDefaultHabitatProfiles,
  buildHabitatProfile,
  deleteHabitatProfile,
  exportHabitatProfileJson,
  formatHabitatProfileDiff,
  getRecentHabitatProfiles,
  importHabitatProfileJson,
  loadHabitatProfiles,
  normalizeHabitatProfile,
  pinHabitatProfile,
  reorderHabitatProfiles,
  sortHabitatProfiles,
  unpinHabitatProfile,
  updateHabitatProfile
} from '@/lib/tiekat/habitatProfile';

describe('tiekat habitat profiles', () => {
  beforeEach(() => {
    for (const key of Object.keys(db)) delete db[key];
  });

  it('builds deterministic compact shape and excludes raw/private payload fields', () => {
    const profile = buildHabitatProfile({
      name: 'Quiet Reflection',
      description: 'compact local setup',
      now: '2026-03-19T00:00:00.000Z',
      preferences: {
        sessionMode: 'open_reflection',
        councilMode: 'disabled',
        preferProviderBackedCouncil: false,
        showGeometry: false,
        showDiagnostics: false,
        enableV55Framing: false,
        constellationFilters: { mode: 'all', scoringVersion: 'all', shiftType: 'all' },
        ritualDeckFilters: { mode: 'all', scoringVersion: 'all', timeWindow: 'all' },
        promptPresetMode: 'open_reflection'
      }
    });
    expect(profile.name).toBe('Quiet Reflection');
    expect(profile.version.exportVersion).toBe('TIEKAT-habitat-profile-v1');
    expect(JSON.stringify(profile)).not.toContain('messages');
    expect(JSON.stringify(profile)).not.toContain('ancestor name');
  });

  it('normalizes defaults and returns canonical default profile set', () => {
    const normalized = normalizeHabitatProfile({ id: 'legacy' });
    expect(normalized.preferences.sessionMode).toBe('open_reflection');
    expect(normalized.preferences.constellationFilters.shiftType).toBe('all');
    expect(normalized.pinned).toBe(false);
    expect(normalized.sortOrder).toBe(0);

    const defaults = buildDefaultHabitatProfiles();
    expect(defaults.map((profile) => profile.name)).toEqual([
      'Quiet Reflection',
      'Tarot Chamber',
      'Synthesis Oracle',
      'Council Deliberation',
      'Sphere Diagnostics'
    ]);
  });

  it('supports save/load/update/delete and recent ordering', async () => {
    const base = buildHabitatProfile({
      id: 'habitat-a',
      name: 'A',
      now: '2026-03-19T00:00:00.000Z',
      preferences: {
        sessionMode: 'open_reflection',
        councilMode: 'disabled',
        preferProviderBackedCouncil: false,
        showGeometry: false,
        showDiagnostics: false,
        enableV55Framing: false,
        constellationFilters: { mode: 'all', scoringVersion: 'all', shiftType: 'all' },
        ritualDeckFilters: { mode: 'all', scoringVersion: 'all', timeWindow: 'all' },
        promptPresetMode: 'open_reflection'
      }
    });
    await appendHabitatProfile(base);
    const loaded = await loadHabitatProfiles();
    expect(loaded[0].id).toBe('habitat-a');

    await updateHabitatProfile({ ...loaded[0], description: 'updated' });
    const recent = await getRecentHabitatProfiles(1);
    expect(recent[0].description).toBe('updated');

    await deleteHabitatProfile('habitat-a');
    expect((await loadHabitatProfiles()).some((profile) => profile.id === 'habitat-a')).toBe(false);
  });

  it('exports/imports round-trip with validation', () => {
    const profile = buildDefaultHabitatProfiles()[0];
    const json = exportHabitatProfileJson(profile);
    const imported = importHabitatProfileJson(json);
    expect(imported.id).toBe(profile.id);
    expect(imported.preferences.sessionMode).toBe(profile.preferences.sessionMode);
    expect(imported.pinned).toBe(profile.pinned);
    expect(imported.sortOrder).toBe(profile.sortOrder);
    expect(() => importHabitatProfileJson(JSON.stringify({ version: { exportVersion: 'bad-version' } }))).toThrow('Unsupported habitat profile export version');
  });

  it('applies profile with ancestry-safe fallback', () => {
    const profile = buildHabitatProfile({
      name: 'Ancestral Habitat',
      now: '2026-03-19T00:00:00.000Z',
      preferences: {
        sessionMode: 'ancestral_listening',
        councilMode: 'disabled',
        preferProviderBackedCouncil: false,
        showGeometry: true,
        showDiagnostics: false,
        enableV55Framing: false,
        constellationFilters: { mode: 'all', scoringVersion: 'all', shiftType: 'all' },
        ritualDeckFilters: { mode: 'all', scoringVersion: 'all', timeWindow: 'all' },
        promptPresetMode: 'ancestral_listening'
      }
    });
    const denied = applyHabitatProfile({ profile, allowAncestry: false });
    expect(denied.ancestryFallbackApplied).toBe(true);
    expect(denied.appliedSessionMode).not.toBe('ancestral_listening');
    expect(denied.note.toLowerCase()).toContain('ancestry consent is disabled');

    const allowed = applyHabitatProfile({ profile, allowAncestry: true });
    expect(allowed.appliedSessionMode).toBe('ancestral_listening');
  });

  it('builds compact profile diff preview and avoids private/raw leakage', () => {
    const current = buildDefaultHabitatProfiles()[0];
    const target = buildDefaultHabitatProfiles()[4];
    const comparison = compareHabitatProfiles(current, target);
    expect(comparison.sessionModeChanged).toBe(true);
    expect(comparison.diagnosticsVisibilityChanged).toBe(true);

    const diff = buildHabitatProfileDiff({ current, target, allowAncestry: true });
    const text = formatHabitatProfileDiff(diff);
    expect(diff.lines.length).toBeGreaterThan(0);
    expect(text).toContain('Session mode');
    expect(text).not.toContain('messages');
    expect(text).not.toContain('ancestor name');
  });

  it('sorts/pins/unpins/reorders profiles deterministically', () => {
    const defaults = buildDefaultHabitatProfiles();
    const pinned = pinHabitatProfile(defaults, defaults[2].id);
    expect(pinned[0].id).toBe(defaults[2].id);
    expect(pinned[0].pinned).toBe(true);

    const unpinned = unpinHabitatProfile(pinned, defaults[2].id);
    expect(unpinned.some((profile) => profile.id === defaults[2].id && profile.pinned)).toBe(false);

    const reordered = reorderHabitatProfiles(sortHabitatProfiles(defaults), defaults[1].id, 'down');
    expect(reordered.length).toBe(defaults.length);
  });
});
