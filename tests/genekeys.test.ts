import { describe, expect, it } from 'vitest';
import keys from '@/lib/genekeys/keys.json';
import { buildGeneKeysProfile, mapLongitudeToGeneKey } from '@/lib/genekeys';

describe('gene keys mapper', () => {
  it('has 64 keys', () => {
    expect((keys as any[]).length).toBe(64);
  });

  it('maps lines 1..6 deterministically', () => {
    const a = mapLongitudeToGeneKey(0.1);
    const b = mapLongitudeToGeneKey(0.1);
    expect(a).toEqual(b);
    expect(a.line).toBeGreaterThanOrEqual(1);
    expect(a.line).toBeLessThanOrEqual(6);
  });

  it('design date converges stably', () => {
    const one = buildGeneKeysProfile(new Date('1991-06-21T10:10:00Z'));
    const two = buildGeneKeysProfile(new Date('1991-06-21T10:10:00Z'));
    expect(one.designDate).toEqual(two.designDate);
  });
});
