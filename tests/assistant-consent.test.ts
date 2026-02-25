import { describe, expect, it, vi } from 'vitest';
import { buildContextCapsule } from '@/lib/assistant/context';

vi.mock('@/lib/local/settings', () => ({
  loadSettings: () => ({ allowAncestryAi: false, includeNamesInAiContext: false, useBirthProfileInAssistant: false, useSessionsInAssistant: false })
}));
vi.mock('@/lib/local/storage', () => ({
  loadProfiles: () => [],
  loadTarotSessions: () => [],
  loadGeneKeysSessions: () => []
}));

describe('assistant consent gates', () => {
  it('excludes ancestry patterns when disabled', () => {
    const capsule = buildContextCapsule({ people: {}, families: {}, warnings: [] } as any);
    expect(capsule.ancestryPatterns).toBeUndefined();
  });
});
