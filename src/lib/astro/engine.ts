import { Aspect, PlanetPosition } from '@/types';
import { getDecanForSignDegree, getHermeticProfile } from '@/lib/hermetic';
import { Body, Equator, Observer, SiderealTime } from 'astronomy-engine';
import tzLookup from 'tz-lookup';

const zodiac = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const aspectAngles = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 } as const;

export function longitudeToSign(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return { sign: zodiac[signIndex], degreeInSign: normalized % 30 };
}

export function findAspects(positions: PlanetPosition[], orb = 6): Aspect[] {
  const results: Aspect[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const diffRaw = Math.abs(positions[i].longitude - positions[j].longitude);
      const diff = diffRaw > 180 ? 360 - diffRaw : diffRaw;
      for (const [type, angle] of Object.entries(aspectAngles) as [Aspect['type'], number][]) {
        const offset = Math.abs(diff - angle);
        if (offset <= orb) {
          results.push({
            bodyA: positions[i].body,
            bodyB: positions[j].body,
            type,
            orb: offset,
            exactAngle: diff
          });
          break;
        }
      }
    }
  }
  return results.sort((a, b) => a.orb - b.orb);
}

export function estimateAscendant(date: Date, lon: number): number {
  const gst = SiderealTime(date);
  return ((gst * 15 + lon) % 360 + 360) % 360;
}

export function equalHouses(ascendantLongitude: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const long = (ascendantLongitude + i * 30) % 360;
    return { house: i + 1, ...longitudeToSign(long), longitude: long };
  });
}

export function computeChart(date: Date, lat: number, lon: number, orb = 6) {
  const observer = new Observer(lat, lon, 0);
  const bodies: Body[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const placements: PlanetPosition[] = bodies.map((body) => {
    const eq = Equator(body, date, observer, true, true);
    const longitude = ((eq.ra * 15) % 360 + 360) % 360;
    const { sign, degreeInSign } = longitudeToSign(longitude);
    return { body, longitude, sign, degreeInSign };
  });

  const ascendant = estimateAscendant(date, lon);
  const houses = equalHouses(ascendant).map((h) => ({ house: h.house, sign: h.sign, degreeInSign: h.degreeInSign }));
  const aspects = findAspects(placements, orb);
  const profile = getHermeticProfile('gd');

  const majorKeys = placements.slice(0, 3).map((p) => `${p.body}: ${profile.sign_to_major_key[p.sign]}`);
  const decanKeys = placements.map((p) => getDecanForSignDegree(p.sign, p.degreeInSign)?.minor_card).filter(Boolean) as string[];

  return { placements, aspects, houses, ascendantEstimated: true, hermeticKeys: [...majorKeys, ...decanKeys.slice(0, 6)] };
}

export async function geocodePlace(place: string) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
  if (!res.ok) throw new Error('Unable to geocode place');
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data[0]) throw new Error('No place match found');
  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  return { lat, lon, timezone: tzLookup(lat, lon) };
}
