import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { isTestMode } from '@/lib/env';
import { z } from 'zod';
import { computeChart, geocodePlace } from '@/lib/astro/engine';
import { demoAstroInterpretation } from '@/lib/ai/demo';
import { buildGroundingPacketAstro } from '@/lib/reading/grounding';

const schema = z.object({
  name: z.string().optional(),
  date: z.string(),
  time: z.string(),
  place: z.string().optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
  timezone: z.string().optional(),
  orb: z.number().optional(),
  zodiacMode: z.enum(['tropical', 'sidereal']).default('tropical'),
  minorAspects: z.boolean().optional(),
  demoMode: z.boolean().optional(),
  includeExtraBodies: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const data = schema.parse(await req.json());
  const test = isTestMode();
  const forcedDemo = test || data.demoMode;
  let lat = Number(data.lat), lon = Number(data.lon), timezone = data.timezone;

  if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && data.place && !test) {
    const geo = await geocodePlace(data.place);
    lat = geo.lat;
    lon = geo.lon;
    timezone = geo.timezone;
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    if (test) {
      lat = 40.7128;
      lon = -74.006;
      timezone = 'America/New_York';
    } else {
      return NextResponse.json({ error: 'Missing coordinates or place lookup failed', ascendantAvailable: false }, { status: 400 });
    }
  }

  const date = new Date(`${data.date}T${data.time}:00`);
  const chart = computeChart(date, lat, lon, data.orb ?? 6, data.zodiacMode, Boolean(data.minorAspects), data.includeExtraBodies ?? true);
  const packet = buildGroundingPacketAstro({ placements: chart.placements, aspects: chart.aspects.slice(0, 5), houses: chart.houses, keys: chart.hermeticKeys, dignityNotes: chart.dignityNotes, aspectTags: chart.aspectTags });
  return NextResponse.json({ ...chart, timezone, interpretation: demoAstroInterpretation(chart.placements, chart.aspects, chart.hermeticKeys), packet, mode: forcedDemo ? 'demo' : 'computed' });
}
