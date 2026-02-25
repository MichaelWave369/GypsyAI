import { describe, it, expect } from 'vitest';
import { findAspects } from '@/lib/astro/engine';

describe('aspect math', () => {
  it('detects known angles', () => {
    const aspects = findAspects(
      [
        { body: 'A', longitude: 0, sign: 'Aries', degreeInSign: 0 },
        { body: 'B', longitude: 60, sign: 'Gemini', degreeInSign: 0 },
        { body: 'C', longitude: 180, sign: 'Libra', degreeInSign: 0 }
      ],
      0.1
    );

    expect(aspects.find((a) => a.bodyA === 'A' && a.bodyB === 'B')?.type).toBe('sextile');
    expect(aspects.find((a) => a.bodyA === 'A' && a.bodyB === 'C')?.type).toBe('opposition');
  });
});
