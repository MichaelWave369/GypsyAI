import keys from './keys.json';
import lines from './lines.json';
import mandala from './mandala.json';
import { Body, EclipticLongitude } from 'astronomy-engine';

export type GuideMode = 'contemplation' | 'direct';

export interface KeyLineMapping {
  key: number;
  line: number;
  exactDegreeWithinKey: number;
}

export const geneKeys = keys;
export const lineThemes = lines;

export function mapLongitudeToGeneKey(longitude: number): KeyLineMapping {
  const normalized = ((longitude % 360) + 360) % 360;
  const segment = mandala.find((m) => normalized >= m.start_degree && normalized < m.end_degree) ?? mandala[mandala.length - 1];
  const within = normalized - segment.start_degree;
  const line = Math.min(6, Math.max(1, Math.floor(within / segment.line_size) + 1));
  return { key: segment.key, line, exactDegreeWithinKey: Number(within.toFixed(4)) };
}

export function findDesignDate(birthDate: Date, targetSunLong: number): Date {
  let low = new Date(birthDate.getTime() - 110 * 86400000);
  let high = new Date(birthDate.getTime() - 70 * 86400000);
  const normalize = (x: number) => ((x % 360) + 360) % 360;
  const dist = (a: number, b: number) => {
    const d = Math.abs(normalize(a) - normalize(b));
    return d > 180 ? 360 - d : d;
  };

  for (let i = 0; i < 50; i++) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const midSun = EclipticLongitude('Sun', mid);
    const lowSun = EclipticLongitude('Sun', low);
    if (dist(midSun, targetSunLong) < dist(lowSun, targetSunLong)) low = mid;
    else high = mid;
  }
  return new Date((low.getTime() + high.getTime()) / 2);
}

export function buildGeneKeysProfile(date: Date) {
  const bodies: Body[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const birthSun = EclipticLongitude('Sun', date);
  const birthEarth = (birthSun + 180) % 360;

  const designTarget = (birthSun - 88 + 360) % 360;
  const designDate = findDesignDate(date, designTarget);
  const designSun = EclipticLongitude('Sun', designDate);
  const designEarth = (designSun + 180) % 360;

  const personalitySun = mapLongitudeToGeneKey(birthSun);
  const personalityEarth = mapLongitudeToGeneKey(birthEarth);
  const designSunMap = mapLongitudeToGeneKey(designSun);
  const designEarthMap = mapLongitudeToGeneKey(designEarth);

  const planetary = bodies.map((b) => {
    const longitude = EclipticLongitude(b, date);
    return { body: b, longitude, ...mapLongitudeToGeneKey(longitude) };
  });

  return {
    designDate: designDate.toISOString(),
    activationSequence: {
      lifeWork: personalitySun,
      evolution: personalityEarth,
      radiance: designSunMap,
      purpose: designEarthMap
    },
    planetary
  };
}

export function getKeySummary(num: number) {
  return geneKeys.find((k) => k.number === num);
}
