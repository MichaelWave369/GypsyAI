import { describe, expect, it } from 'vitest';
import {
  buildSessionModePromptFrame,
  getDefaultSessionMode,
  getModePreferredModules,
  getSessionModeConfig,
  resolveSessionMode
} from '@/lib/tiekat/sessionMode';

describe('tiekat session mode', () => {
  it('provides deterministic default mode', () => {
    expect(getDefaultSessionMode()).toBe('open_reflection');
  });

  it('resolves invalid and ancestry-disallowed modes safely', () => {
    expect(resolveSessionMode('not-real', { allowAncestry: true })).toBe('open_reflection');
    expect(resolveSessionMode('ancestral_listening', { allowAncestry: false })).toBe('open_reflection');
  });

  it('builds mode prompt frame and module preferences', () => {
    const config = getSessionModeConfig('synthesis_oracle');
    expect(config.presentation.label).toBe('Synthesis Oracle');
    expect(getModePreferredModules('ancestral_listening', { allowAncestry: false })).not.toContain('ancestry');
    expect(buildSessionModePromptFrame('synthesis_oracle', { allowAncestry: false })).toContain('Session Mode');
  });
});
