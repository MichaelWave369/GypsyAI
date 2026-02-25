import { Aspect, PlanetPosition } from '@/types';
import { getDecanForSignDegree, getHermeticProfile } from '@/lib/hermetic';
import { EclipticLongitude } from 'astronomy-engine';
import tzLookup from 'tz-lookup';

const zodiac = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const baseAspectAngles = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 } as const;
const minorAspectAngles = { semisextile: 30, quincunx: 150 } as const;

const aspectTagMap: Record<string, string> = {
  'Sun-square-Saturn': 'pressure/responsibility theme',
  'Sun-conjunction-Moon': 'identity-feeling alignment',
  'Moon-opposition-Saturn': 'emotional restraint/patience theme'
};

const domicile: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mercury: ['Gemini', 'Virgo'], Venus: ['Taurus', 'Libra'], Mars: ['Aries', 'Scorpio'], Jupiter: ['Sagittarius', 'Pisces'], Saturn: ['Capricorn', 'Aquarius']
};

export function longitudeToSign(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return { sign: zodiac[signIndex], degreeInSign: normalized % 30, longitude: normalized };
}
export const julianDate = (date: Date) => date.getTime() / 86400000 + 2440587.5;
export function gmstDegrees(date: Date) {
  const jd = julianDate(date); const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000;
  return ((gmst % 360) + 360) % 360;
}
export const localSiderealDegrees = (date: Date, lon: number) => ((gmstDegrees(date) + lon) % 360 + 360) % 360;

export function ascendantMc(date: Date, lat: number, lon: number) {
  const lst = (localSiderealDegrees(date, lon) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const eps = (23.4392911 * Math.PI) / 180;
  const mc = Math.atan2(Math.sin(lst) * Math.cos(eps), Math.cos(lst));
  const asc = Math.atan2(-Math.cos(lst), Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(lst));
  return { ascendant: ((asc * 180) / Math.PI + 180 + 360) % 360, mc: ((mc * 180) / Math.PI + 360) % 360 };
}

const ayanamsaApprox = 24;


function sunLongitudeApprox(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const day = diff / 86400000;
  return ((day * 0.985647 + 280.46) % 360 + 360) % 360;
}

function eclipticLongitudeSafe(body: string, date: Date) {
  if (body === 'Sun') return sunLongitudeApprox(date);
  return EclipticLongitude(body as any, date);
}


export function findAspects(positions: PlanetPosition[], orb = 6, withMinor = false): Aspect[] {
  const angles = withMinor ? { ...baseAspectAngles, ...minorAspectAngles } : baseAspectAngles;
  const results: Aspect[] = [];
  for (let i = 0; i < positions.length; i++) for (let j = i + 1; j < positions.length; j++) {
    const diffRaw = Math.abs(positions[i].longitude - positions[j].longitude);
    const diff = diffRaw > 180 ? 360 - diffRaw : diffRaw;
    for (const [type, angle] of Object.entries(angles) as [Aspect['type'], number][]) {
      const offset = Math.abs(diff - angle);
      if (offset <= orb) { results.push({ bodyA: positions[i].body, bodyB: positions[j].body, type, orb: offset, exactAngle: diff, strength: Number((1 - offset / orb).toFixed(4)), tag: aspectTagMap[`${positions[i].body}-${type}-${positions[j].body}`] ?? 'dynamic integration theme' }); break; }
    }
  }
  return results.sort((a, b) => b.strength - a.strength);
}

export const equalHouses = (ascendantLongitude: number) => Array.from({ length: 12 }, (_, i) => { const long = (ascendantLongitude + i * 30) % 360; return { house: i + 1, ...longitudeToSign(long), cusp: long }; });

function retrogradeNow(body: string, date: Date) {
  const later = new Date(date.getTime() + 86400000);
  const now = eclipticLongitudeSafe(body, date); const next = eclipticLongitudeSafe(body, later);
  return next < now;
}

function dignityNote(body: string, sign: string) {
  if (!(body in domicile)) return 'modern body: no traditional dignity';
  return domicile[body].includes(sign) ? 'domicile support' : 'no major dignity';
}

export function computeChart(date: Date, lat: number, lon: number, orb = 6, zodiacMode: 'tropical' | 'sidereal' = 'tropical', minorAspects = false, extraBodies = true) {
  const bodies: string[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', ...(extraBodies ? ['Chiron', 'TrueNode'] : [])];
  const placements: PlanetPosition[] = bodies.map((body) => {
    const tropicalLong = eclipticLongitudeSafe(body, date);
    const longitude = zodiacMode === 'sidereal' ? (tropicalLong - ayanamsaApprox + 360) % 360 : tropicalLong;
    const { sign, degreeInSign } = longitudeToSign(longitude);
    return { body, longitude, sign, degreeInSign, retrograde: retrogradeNow(body, date), dignity: dignityNote(body, sign) } as PlanetPosition;
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
  const majorKeys = [`Sun: ${profile.sign_to_major_key[sun?.sign ?? 'Aries']}`, `Moon: ${profile.sign_to_major_key[moon?.sign ?? 'Aries']}`, `Rising: ${profile.sign_to_major_key[rising.sign]}`];
  const decanKeys = placements.map((p) => getDecanForSignDegree(p.sign, p.degreeInSign)?.minor_card).filter(Boolean) as string[];
  const dignityNotes = placements.filter((p) => p.body in domicile).map((p:any)=>`${p.body} in ${p.sign}: ${p.dignity}`);

  return { placements, aspects, houses, ascendant: ascLong, mc: mcLong, ascendantSign: longitudeToSign(ascLong), mcSign: longitudeToSign(mcLong), ascendantAvailable: true, zodiacMode, ayanamsa: zodiacMode === 'sidereal' ? 'Lahiri approximation (~24° fixed offset)' : 'none', hermeticKeys: [...majorKeys, ...decanKeys.slice(0, 6)], dignityNotes, aspectTags: aspects.slice(0,5).map((a)=>`${a.bodyA} ${a.type} ${a.bodyB}: ${a.tag}`) };
}

export async function geocodePlace(place: string) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
  if (!res.ok) throw new Error('Unable to geocode place');
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data[0]) throw new Error('No place match found');
  const lat = parseFloat(data[0].lat); const lon = parseFloat(data[0].lon);
  return { lat, lon, timezone: tzLookup(lat, lon) };
}
