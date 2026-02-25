import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { z } from 'zod';
import { computeChart, geocodePlace } from '@/lib/astro/engine';
import { buildDemoChart } from '@/lib/astro/demo';
import { demoAstroInterpretation } from '@/lib/ai/demo';
import { buildGroundingPacketAstro } from '@/lib/reading/grounding';
import { isTestMode } from '@/lib/runtime/isTestMode';

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
  const forcedDemo = isTestMode() || Boolean(data.demoMode);

  if (forcedDemo) {
    const demoChart = buildDemoChart({ date: data.date, time: data.time, zodiacMode: data.zodiacMode });
    const packet = buildGroundingPacketAstro({ placements: demoChart.placements, aspects: demoChart.aspects.slice(0, 5), houses: demoChart.houses, keys: demoChart.hermeticKeys, dignityNotes: demoChart.dignityNotes, aspectTags: demoChart.aspectTags });
    return NextResponse.json({ ...demoChart, timezone: data.timezone ?? 'America/New_York', interpretation: demoAstroInterpretation(demoChart.placements, demoChart.aspects, demoChart.hermeticKeys), packet, mode: 'demo' });
  }

  let lat = Number(data.lat);
  let lon = Number(data.lon);
  let timezone = data.timezone;

  if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && data.place) {
    const geo = await geocodePlace(data.place);
    lat = geo.lat;
    lon = geo.lon;
    timezone = geo.timezone;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'Missing coordinates or place lookup failed', ascendantAvailable: false }, { status: 400 });
  }

  try {
    const date = new Date(`${data.date}T${data.time}:00`);
    const chart = computeChart(date, lat, lon, data.orb ?? 6, data.zodiacMode, Boolean(data.minorAspects), data.includeExtraBodies ?? true);
    const packet = buildGroundingPacketAstro({ placements: chart.placements, aspects: chart.aspects.slice(0, 5), houses: chart.houses, keys: chart.hermeticKeys, dignityNotes: chart.dignityNotes, aspectTags: chart.aspectTags });
    return NextResponse.json({ ...chart, timezone, interpretation: demoAstroInterpretation(chart.placements, chart.aspects, chart.hermeticKeys), packet, mode: 'computed' });
  } catch (err) {
    console.error('ASTRO_COMPUTE_FAILED', err);
    const demoChart = buildDemoChart({ date: data.date, time: data.time, lat, lon, zodiacMode: data.zodiacMode });
    const packet = buildGroundingPacketAstro({ placements: demoChart.placements, aspects: demoChart.aspects.slice(0, 5), houses: demoChart.houses, keys: demoChart.hermeticKeys, dignityNotes: demoChart.dignityNotes, aspectTags: demoChart.aspectTags });
    return NextResponse.json({ ...demoChart, timezone: timezone ?? 'UTC', interpretation: demoAstroInterpretation(demoChart.placements, demoChart.aspects, demoChart.hermeticKeys), packet, mode: 'fallback', warning: 'Astrology engine fallback used.' });
  }
}
