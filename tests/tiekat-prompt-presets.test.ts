import { describe, expect, it } from 'vitest';
import { getPromptPresetGroup, getPromptPresetMap, markPresetUsed, orderPresetsByRecent } from '@/lib/tiekat/promptPresets';

describe('tiekat prompt presets', () => {
  it('contains deterministic preset groups for all session modes', () => {
    const map = getPromptPresetMap();
    expect(Object.keys(map).length).toBe(6);
    expect(map.open_reflection.presets.length).toBeGreaterThan(0);
    expect(map.synthesis_oracle.presets.length).toBeGreaterThan(0);
  });

  it('filters ancestry-sensitive prompts when ancestry consent is disabled', () => {
    const blocked = getPromptPresetGroup('ancestral_listening', false);
    expect(blocked.presets.length).toBe(0);
    const allowed = getPromptPresetGroup('ancestral_listening', true);
    expect(allowed.presets.length).toBeGreaterThan(0);
  });

  it('orders presets by recent local usage when available', () => {
    const store: Record<string, string> = {};
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        }
      }
    };
    const group = getPromptPresetGroup('open_reflection', false);
    markPresetUsed('open_reflection', group.presets[1].id, true);
    const ordered = orderPresetsByRecent('open_reflection', group);
    expect(ordered.presets[0].id).toBe(group.presets[1].id);
  });
});
