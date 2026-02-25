import { describe, it, expect } from 'vitest';
import { ascendantMc, equalHouses, findAspects } from '@/lib/astro/engine';

describe('aspect + house math', () => {
  it('detects known angles and strength', () => {
    const aspects = findAspects(
      [
        { body: 'A', longitude: 0, sign: 'Aries', degreeInSign: 0 },
        { body: 'B', longitude: 60, sign: 'Gemini', degreeInSign: 0 },
        { body: 'C', longitude: 180, sign: 'Libra', degreeInSign: 0 }
      ],
      1
    );
    expect(aspects.find((a) => a.bodyA === 'A' && a.bodyB === 'B')?.type).toBe('sextile');
    expect(aspects.find((a) => a.bodyA === 'A' && a.bodyB === 'C')?.type).toBe('opposition');
    expect(aspects[0].strength).toBeGreaterThanOrEqual(0);
  });

  it('derives equal houses from ascendant', () => {
    const houses = equalHouses(123.5);
    expect(houses).toHaveLength(12);
    expect(houses[0].cusp).toBeCloseTo(123.5, 5);
    expect(houses[1].cusp).toBeCloseTo(153.5, 5);
  });

  it('computes asc and mc sanity for fixture', () => {
    const out = ascendantMc(new Date('1990-01-01T12:00:00Z'), 51.5, -0.12);
    expect(out.ascendant).toBeGreaterThanOrEqual(0);
    expect(out.ascendant).toBeLessThan(360);
    expect(out.mc).toBeGreaterThanOrEqual(0);
    expect(out.mc).toBeLessThan(360);
  });
});
