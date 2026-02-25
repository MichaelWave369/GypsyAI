import { Aspect, PlanetPosition } from '@/types';
import { findAspects, longitudeToSign, equalHouses } from './engine';

const demoBodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

function makePlacement(body: string, degree: number): PlanetPosition {
  const p = longitudeToSign(degree);
  return {
    body,
    longitude: p.longitude,
    sign: p.sign,
    degreeInSign: Number(p.degreeInSign.toFixed(2)),
    retrograde: false,
    dignity: 'demo fallback'
  };
}

export function buildDemoChart(input: { date?: string; time?: string; lat?: number; lon?: number; zodiacMode?: 'tropical' | 'sidereal' }) {
  const seed = hashSeed(`${input.date ?? '1990-01-01'}T${input.time ?? '12:00'}`);
  const placements = demoBodies.map((body, i) => makePlacement(body, (seed + i * 33.3) % 360));
  const aspects = findAspects(placements, 6, false).slice(0, 6);
  const ascendant = (seed + 90) % 360;
  const mc = (seed + 180) % 360;
  const houses = equalHouses(ascendant).map((h) => ({ house: h.house, sign: h.sign, degreeInSign: Number(h.degreeInSign.toFixed(2)), cusp: Number(h.cusp.toFixed(2)) }));

  const fallbackAspects: Aspect[] = aspects.length
    ? aspects
    : [
        { bodyA: 'Sun', bodyB: 'Moon', type: 'trine', orb: 1.2, exactAngle: 120, strength: 0.8, tag: 'identity-feeling flow' },
        { bodyA: 'Mars', bodyB: 'Saturn', type: 'square', orb: 2.1, exactAngle: 90, strength: 0.65, tag: 'discipline and pressure' }
      ];

  return {
    placements,
    aspects: fallbackAspects,
    houses,
    ascendant,
    mc,
    ascendantSign: longitudeToSign(ascendant),
    mcSign: longitudeToSign(mc),
    ascendantAvailable: true,
    zodiacMode: input.zodiacMode ?? 'tropical',
    ayanamsa: input.zodiacMode === 'sidereal' ? 'Lahiri approximation (~24° fixed offset)' : 'none',
    hermeticKeys: ['Sun: XIX The Sun', 'Moon: II The High Priestess', `Rising: ${longitudeToSign(ascendant).sign}`],
    dignityNotes: placements.slice(0, 4).map((p) => `${p.body} in ${p.sign}: demo fallback`),
    aspectTags: fallbackAspects.map((a) => `${a.bodyA} ${a.type} ${a.bodyB}: ${a.tag ?? 'theme'}`)
  };
}
