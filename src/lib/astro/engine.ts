import { Aspect, PlanetPosition } from '@/types';
import { getDecanForSignDegree, getHermeticProfile } from '@/lib/hermetic';
import { Body, EclipticLongitude } from 'astronomy-engine';
import tzLookup from 'tz-lookup';

const zodiac = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const baseAspectAngles = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 } as const;
const minorAspectAngles = { semisextile: 30, quincunx: 150 } as const;

export function longitudeToSign(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return { sign: zodiac[signIndex], degreeInSign: normalized % 30, longitude: normalized };
}

export function julianDate(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function gmstDegrees(date: Date) {
  const jd = julianDate(date);
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000;
  return ((gmst % 360) + 360) % 360;
}

export function localSiderealDegrees(date: Date, lon: number) {
  return ((gmstDegrees(date) + lon) % 360 + 360) % 360;
}

export function ascendantMc(date: Date, lat: number, lon: number) {
  const lst = (localSiderealDegrees(date, lon) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const eps = (23.4392911 * Math.PI) / 180;

  const mc = Math.atan2(Math.sin(lst) * Math.cos(eps), Math.cos(lst));
  const mcDeg = ((mc * 180) / Math.PI + 360) % 360;

  const asc = Math.atan2(
    -Math.cos(lst),
    Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(lst)
  );
  const ascDeg = ((asc * 180) / Math.PI + 180 + 360) % 360;

  return { ascendant: ascDeg, mc: mcDeg };
}

const ayanamsaApprox = 24;

export function findAspects(positions: PlanetPosition[], orb = 6, withMinor = false): Aspect[] {
  const angles = withMinor ? { ...baseAspectAngles, ...minorAspectAngles } : baseAspectAngles;
  const results: Aspect[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const diffRaw = Math.abs(positions[i].longitude - positions[j].longitude);
      const diff = diffRaw > 180 ? 360 - diffRaw : diffRaw;
      for (const [type, angle] of Object.entries(angles) as [Aspect['type'], number][]) {
        const offset = Math.abs(diff - angle);
        if (offset <= orb) {
          results.push({
            bodyA: positions[i].body,
            bodyB: positions[j].body,
            type,
            orb: offset,
            exactAngle: diff,
            strength: Number((1 - offset / orb).toFixed(4))
          });
          break;
        }
      }
    }
  }
  return results.sort((a, b) => b.strength - a.strength);
}

export function equalHouses(ascendantLongitude: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const long = (ascendantLongitude + i * 30) % 360;
    return { house: i + 1, ...longitudeToSign(long), cusp: long };
  });
}

export function computeChart(
  date: Date,
  lat: number,
  lon: number,
  orb = 6,
  zodiacMode: 'tropical' | 'sidereal' = 'tropical',
  minorAspects = false
) {
  const bodies: Body[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const placements: PlanetPosition[] = bodies.map((body) => {
    const tropicalLong = EclipticLongitude(body, date);
    const longitude = zodiacMode === 'sidereal' ? (tropicalLong - ayanamsaApprox + 360) % 360 : tropicalLong;
    const { sign, degreeInSign } = longitudeToSign(longitude);
    return { body, longitude, sign, degreeInSign };
  });

  const { ascendant, mc } = ascendantMc(date, lat, lon);
  const ascLong = zodiacMode === 'sidereal' ? (ascendant - ayanamsaApprox + 360) % 360 : ascendant;
  const mcLong = zodiacMode === 'sidereal' ? (mc - ayanamsaApprox + 360) % 360 : mc;

  const houses = equalHouses(ascLong).map((h) => ({ house: h.house, sign: h.sign, degreeInSign: h.degreeInSign, cusp: h.cusp }));
  const aspects = findAspects(placements, orb, minorAspects);
  const profile = getHermeticProfile('gd');

  const sun = placements.find((p) => p.body === 'Sun');
  const moon = placements.find((p) => p.body === 'Moon');
  const rising = longitudeToSign(ascLong);
  const majorKeys = [
    `Sun: ${profile.sign_to_major_key[sun?.sign ?? 'Aries']}`,
    `Moon: ${profile.sign_to_major_key[moon?.sign ?? 'Aries']}`,
    `Rising: ${profile.sign_to_major_key[rising.sign]}`
  ];
  const decanKeys = placements.map((p) => getDecanForSignDegree(p.sign, p.degreeInSign)?.minor_card).filter(Boolean) as string[];

  return {
    placements,
    aspects,
    houses,
    ascendant: ascLong,
    mc: mcLong,
    ascendantSign: longitudeToSign(ascLong),
    mcSign: longitudeToSign(mcLong),
    ascendantAvailable: true,
    zodiacMode,
    ayanamsa: zodiacMode === 'sidereal' ? 'Lahiri approximation (~24° fixed offset)' : 'none',
    hermeticKeys: [...majorKeys, ...decanKeys.slice(0, 6)]
  };
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
