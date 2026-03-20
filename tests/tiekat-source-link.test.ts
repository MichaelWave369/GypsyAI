import { describe, expect, it } from 'vitest';
import { APP_LICENSE_ID, APP_SOURCE_LABEL, APP_SOURCE_URL } from '@/lib/app/sourceInfo';
import { formatHabitatDeckSavedLabel } from '@/lib/tiekat/habitatDeckTime';

describe('source link + continuity polish helpers', () => {
  it('exposes deterministic source info constants', () => {
    expect(APP_SOURCE_LABEL).toBe('Source');
    expect(APP_LICENSE_ID).toBe('AGPL-3.0-or-later');
    expect(APP_SOURCE_URL).toContain('github.com');
  });

  it('keeps source and saved-time text free of private/raw content', () => {
    const saved = formatHabitatDeckSavedLabel({ createdAt: '2026-03-20T00:00:00.000Z' }, '2026-03-20T00:05:00.000Z');
    expect(saved).toBe('saved 5m ago');
    expect(`${APP_SOURCE_LABEL} ${APP_SOURCE_URL} ${saved}`.toLowerCase()).not.toContain('ancestor name');
    expect(`${APP_SOURCE_LABEL} ${APP_SOURCE_URL} ${saved}`.toLowerCase()).not.toContain('message');
  });
});
