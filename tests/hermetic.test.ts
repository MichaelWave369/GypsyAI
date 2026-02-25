import { describe, it, expect } from 'vitest';
import { getHermeticProfile, getDecanForSignDegree } from '@/lib/hermetic';

describe('hermetic correspondences', () => {
  it('contains 36 decans', () => {
    expect(getHermeticProfile('gd').decans).toHaveLength(36);
  });

  it('maps decan deterministically', () => {
    const a = getDecanForSignDegree('Aries', 4);
    const b = getDecanForSignDegree('Aries', 4);
    expect(a?.minor_card).toBe('2 of Wands');
    expect(a).toEqual(b);
  });
});
